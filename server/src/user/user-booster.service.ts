import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { Hilti, HiltiDocument } from 'src/schemas/hilti.schema';
import { Booster, BoosterDocument } from 'src/schemas/booster.schema';

@Injectable()
export class UserBoosterService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
    @InjectModel(Hilti.name) private hiltiModel: Model<HiltiDocument>,
    @InjectModel(Booster.name) private boosterModel: Model<BoosterDocument>,
  ) {}

  async loadBoosters(user_id: string) {
    try {
      // PARALEL QUERY - 2 işlem aynı anda
      const [user, dbBoosters] = await Promise.all([
        this.userModel.findById(user_id, { boosters: 1 }).lean().exec(),
        this.boosterModel.find().lean().exec(),
      ]);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // 1. Kullanıcının booster map'i - O(1) erişim için
      const userBoosterMap = new Map(
        user.boosters?.map((ub) => [
          ub.booster.toString(),
          {
            current_level: ub.current_level,
          },
        ]) || [],
      );

      // 2. Verileri birleştir ve filtrele
      const mergedBoosters = dbBoosters.map((dbBooster) => {
        const boosterId = dbBooster._id.toString();
        const userBoosterData = userBoosterMap.get(boosterId);

        let filteredLevelData: any[] = [];
        let currentLevel = 0;

        if (userBoosterData) {
          // UNLOCKED
          currentLevel = userBoosterData.current_level;
          const nextLevel = currentLevel + 1;
          const maxLevel = dbBooster.max_level;

          // Sadece current ve next level data
          filteredLevelData = dbBooster.level_data.filter(
            (ld) =>
              ld.level === currentLevel ||
              (currentLevel < maxLevel && ld.level === nextLevel),
          );
        } else {
          // LOCKED - Sadece level 1
          filteredLevelData = dbBooster.level_data.filter(
            (ld) => ld.level === 1,
          );
        }

        return {
          _id: dbBooster._id,
          title: dbBooster.title,
          required_hilti_level: dbBooster.required_hilti_level,
          max_level: dbBooster.max_level,
          unlock_requirements: dbBooster.unlock_requirements,
          image_url: dbBooster.image_url,
          is_unlocked: !!userBoosterData,
          current_level: currentLevel,
          level_data: filteredLevelData,
        };
      });

      return mergedBoosters;
    } catch (error) {
      console.error('Error in loadBoosters service:', error);
      throw error;
    }
  }

  async upgradeUserBooster(user_id: string, booster_id: string) {
    try {
      // Booster verilerini al
      const dbBooster = await this.boosterModel.findById(booster_id).lean();
      if (!dbBooster) {
        throw new BadRequestException('Booster not found');
      }

      // Level data'yı map'e çevir - O(1) erişim
      const levelDataMap = new Map(
        dbBooster.level_data.map((ld) => [ld.level, ld]),
      );

      // Mevcut booster bilgisini al
      const user = await this.userModel
        .findOne(
          { _id: user_id, boosters: { $elemMatch: { booster: booster_id } } },
          {
            'boosters.$': 1,
            'balance_data.stone': 1,
            'balance_data.dust': 1,
            invite_count: 1,
          },
        )
        .lean();

      if (!user || !user.boosters?.[0]) {
        throw new BadRequestException('Booster not unlocked yet');
      }

      const userBooster = user.boosters[0];
      const currentLevel = userBooster.current_level;
      const nextLevel = currentLevel + 1;

      // Max level kontrolü
      if (currentLevel >= dbBooster.max_level) {
        throw new BadRequestException('Booster is already at max level');
      }

      // Next level data
      const nextLevelData = levelDataMap.get(nextLevel);
      if (!nextLevelData) {
        throw new BadRequestException('Invalid level data');
      }

      const upgradeCost = nextLevelData.upgrade_cost;

      // Rock coins kontrolü
      if (user.balance_data.stone < upgradeCost) {
        throw new BadRequestException(
          `Insufficient rocks. Required: ${upgradeCost.toLocaleString()}, Available: ${user.balance_data.stone.toLocaleString()}`,
        );
      }

      // Profit farkını hesapla
      const currentLevelData = levelDataMap.get(currentLevel);
      const currentProfit = currentLevelData?.profit_per_hour || 0;
      const nextProfit = nextLevelData.profit_per_hour;
      const profitIncrease = nextProfit - currentProfit;

      // ATOMİK GÜNCELLEME - Race condition koruması
      const updatedUser = await this.userModel.findOneAndUpdate(
        {
          _id: user_id,
          boosters: {
            $elemMatch: {
              booster: booster_id,
              current_level: currentLevel, // Race condition koruması
            },
          },
          'balance_data.stone': { $gte: upgradeCost }, // Rock yeterlilik kontrolü
        },
        {
          $inc: {
            'balance_data.stone': -upgradeCost,
            'airdrop_data.profit_per_hour': profitIncrease,
          },
          $set: {
            'boosters.$.current_level': nextLevel,
          },
        },
        { new: true },
      );

      if (!updatedUser) {
        // Detaylı hata kontrolü
        const userAfterFail = await this.userModel
          .findOne(
            { _id: user_id, boosters: { $elemMatch: { booster: booster_id } } },
            { 'boosters.$': 1, 'balance_data.stone': 1 },
          )
          .lean();

        if (!userAfterFail || !userAfterFail?.boosters?.[0]) {
          throw new BadRequestException('Booster not found in your inventory');
        }

        const currentUserBooster = userAfterFail.boosters[0];

        // Level değişti mi? (Concurrent upgrade)
        if (currentUserBooster.current_level !== currentLevel) {
          throw new BadRequestException(
            `Booster level changed. Current: ${currentUserBooster.current_level}, Expected: ${currentLevel}. Please refresh`,
          );
        }

        // Rock yetersiz mi?
        if (userAfterFail.balance_data.stone < upgradeCost) {
          throw new BadRequestException(
            `Insufficient rocks. Required: ${upgradeCost.toLocaleString()}, Available: ${userAfterFail.balance_data.stone.toLocaleString()}`,
          );
        }

        throw new BadRequestException(
          'Failed to upgrade booster. Please try again',
        );
      }

      // Frontend için güncellenmiş booster bilgisi
      const updatedBoosterInfo = this.prepareBoosterInfo(
        dbBooster,
        nextLevel,
        true,
      );

      return {
        success: true,
        message: 'Booster upgraded successfully',
        data: {
          booster: updatedBoosterInfo,
          user: {
            stone: updatedUser.balance_data.stone,
            dust: updatedUser.balance_data.dust,
            profit_per_hour: updatedUser.airdrop_data.profit_per_hour,
          },
        },
      };
    } catch (error) {
      console.error('Error in upgradeUserBooster:', error);
      throw error;
    }
  }

  async unlockUserBooster(user_id: string, booster_id: string) {
    try {
      // Booster verilerini al
      const booster = await this.boosterModel.findById(booster_id).lean();
      if (!booster) {
        throw new BadRequestException('Booster not found');
      }

      // Requirements
      const requirements = booster.unlock_requirements || {};
      const requiredStone = requirements.stone || 0;
      const requiredDust = requirements.dust || 0;
      const requiredInvites = requirements.invite || 0;
      const requiredHiltiLevel = parseInt(
        booster.required_hilti_level.split('_')[1],
      );

      // Level 1 profit (unlock sonrası kazanç)
      const levelOneProfit = booster.level_data?.[0]?.profit_per_hour || 0;

      // Build query conditions
      const queryConditions: any = {
        _id: user_id,
        // Booster zaten unlock edilmiş mi kontrolü
        'boosters.booster': { $nin: [booster_id] },
        // Hilti level kontrolü
        $expr: {
          $gte: [
            {
              $toInt: {
                $arrayElemAt: [{ $split: ['$hilti_data.hilti', '_'] }, 1],
              },
            },
            requiredHiltiLevel,
          ],
        },
        // Invite kontrolü
        invite_count: { $gte: requiredInvites },
      };

      // Stone requirement varsa ekle
      if (requiredStone > 0) {
        queryConditions['balance_data.stone'] = { $gte: requiredStone };
      }

      // Dust requirement varsa ekle
      if (requiredDust > 0) {
        queryConditions['balance_data.dust'] = { $gte: requiredDust };
      }

      // Build update operations
      const updateOperations: any = {
        $push: {
          boosters: {
            booster: booster_id,
            current_level: 1,
          },
        },
        $inc: {
          'airdrop_data.profit_per_hour': levelOneProfit,
        },
      };

      // Stone harcama
      if (requiredStone > 0) {
        updateOperations.$inc['balance_data.stone'] = -requiredStone;
      }

      // Dust harcama
      if (requiredDust > 0) {
        updateOperations.$inc['balance_data.dust'] = -requiredDust;
      }

      // ATOMİK İŞLEM - TÜM KONTROLLER VE GÜNCELLEMELER TEK SORGUDA
      const updatedUser = await this.userModel.findOneAndUpdate(
        queryConditions,
        updateOperations,
        { new: true },
      );

      // Başarısız olursa detaylı hata kontrolü
      if (!updatedUser) {
        const userAfterFail = await this.userModel.findById(user_id).lean();
        if (!userAfterFail) {
          throw new BadRequestException('User not found');
        }

        // Öncelik sırasına göre hata mesajları
        const isAlreadyUnlocked = userAfterFail.boosters.some(
          (b) => b.booster.toString() === booster_id,
        );
        if (isAlreadyUnlocked) {
          throw new BadRequestException('Booster already unlocked');
        }

        const userHiltiLevel = parseInt(
          userAfterFail.hilti_data.hilti.split('_')[1],
        );
        if (userHiltiLevel < requiredHiltiLevel) {
          throw new BadRequestException(
            `Hilti level too low. Required: Level ${requiredHiltiLevel}, Current: Level ${userHiltiLevel}`,
          );
        }

        if (
          requiredStone > 0 &&
          userAfterFail.balance_data.stone < requiredStone
        ) {
          throw new BadRequestException(
            `Insufficient stones. Required: ${requiredStone.toLocaleString()}, Available: ${userAfterFail.balance_data.stone.toLocaleString()}`,
          );
        }

        if (
          requiredDust > 0 &&
          userAfterFail.balance_data.dust < requiredDust
        ) {
          throw new BadRequestException(
            `Insufficient dust. Required: ${requiredDust.toLocaleString()}, Available: ${userAfterFail.balance_data.dust.toLocaleString()}`,
          );
        }

        if (userAfterFail.invite_count < requiredInvites) {
          throw new BadRequestException(
            `Not enough invites. Required: ${requiredInvites}, Current: ${userAfterFail.invite_count}`,
          );
        }

        throw new BadRequestException(
          'Failed to unlock booster. Please try again',
        );
      }

      // Frontend için booster bilgisini hazırla
      const unlockedBoosterInfo = this.prepareBoosterInfo(booster, 1, true);

      return {
        success: true,
        message: 'Booster unlocked successfully',
        data: {
          booster: unlockedBoosterInfo,
          user: {
            stone: updatedUser.balance_data.stone,
            dust: updatedUser.balance_data.dust,
            profit_per_hour: updatedUser.airdrop_data.profit_per_hour,
          },
        },
      };
    } catch (error) {
      console.error('Error in unlockUserBooster:', error);
      throw error;
    }
  }

  // Helper method: Frontend için booster bilgisini hazırla
  private prepareBoosterInfo(
    dbBooster: any,
    currentLevel: number,
    isUnlocked: boolean,
  ) {
    const maxLevel = dbBooster.max_level;
    const nextLevel = currentLevel + 1;

    // Sadece current ve next level data'sını filtrele
    let filteredLevelData: any[] = [];
    if (isUnlocked && currentLevel < maxLevel) {
      filteredLevelData = dbBooster.level_data.filter(
        (ld) => ld.level === currentLevel || ld.level === nextLevel,
      );
    } else if (isUnlocked && currentLevel >= maxLevel) {
      // Max level - sadece current level
      filteredLevelData = dbBooster.level_data.filter(
        (ld) => ld.level === currentLevel,
      );
    } else {
      // Locked - level 1
      filteredLevelData = dbBooster.level_data.filter((ld) => ld.level === 1);
    }

    return {
      _id: dbBooster._id,
      title: dbBooster.title,
      required_hilti_level: dbBooster.required_hilti_level,
      max_level: dbBooster.max_level,
      unlock_requirements: dbBooster.unlock_requirements,
      image_url: dbBooster.image_url,
      is_unlocked: isUnlocked,
      current_level: currentLevel,
      level_data: filteredLevelData,
    };
  }
}
