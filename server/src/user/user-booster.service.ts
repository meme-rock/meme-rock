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
        this.userModel
          .findById(user_id, { 'game_data.boosters': 1 })
          .lean()
          .exec(),
        this.boosterModel.find().lean().exec(),
      ]);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // 1. Kullanıcının booster map'i - O(1) erişim için
      const userBoosterMap = new Map(
        user.game_data?.boosters?.map((ub) => [
          ub.booster_id.toString(),
          {
            current_level: ub.current_level,
            unlocked_at: ub.unlocked_at,
            last_upgraded_at: ub.last_upgraded_at,
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
          unlocked_at: userBoosterData?.unlocked_at,
          last_upgraded_at: userBoosterData?.last_upgraded_at,
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
      // Booster verilerini al (cache'lenebilir)
      const dbBooster = await this.boosterModel.findById(booster_id).lean();
      if (!dbBooster) {
        throw new BadRequestException('Booster not found');
      }

      // Level data'yı map'e çevir - hızlı erişim
      const levelDataMap = new Map(
        dbBooster.level_data.map((ld) => [ld.level, ld]),
      );

      // TÜM KONTROLLER VERİTABANI SEVİYESİNDE
      // Önce mevcut user booster bilgisini alalım
      const user = await this.userModel
        .findOne(
          { _id: user_id, 'game_data.boosters.booster_id': booster_id },
          { 'game_data.boosters.$': 1, 'game_data.stones': 1 },
        )
        .lean();

      if (!user || !user.game_data?.boosters?.[0]) {
        throw new BadRequestException('Booster not unlocked yet');
      }

      const userBooster = user.game_data.boosters[0];
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

      // Stone kontrolü
      if (user.game_data.stones < upgradeCost) {
        throw new BadRequestException(
          `Insufficient stones. Required: ${upgradeCost.toLocaleString()}`,
        );
      }

      // Profit farkını hesapla
      const currentLevelData = levelDataMap.get(currentLevel);
      const currentProfit = currentLevelData?.profit_per_hour || 0;
      const nextProfit = nextLevelData.profit_per_hour;
      const profitIncrease = nextProfit - currentProfit;

      // ATOMİK GÜNCELLEME - TÜM KONTROLLER DB SEVİYESİNDE
      const updatedUser = await this.userModel.findOneAndUpdate(
        {
          _id: user_id,
          'game_data.boosters': {
            $elemMatch: {
              booster_id: booster_id,
              current_level: currentLevel, // Race condition koruması
            },
          },
          'game_data.stones': { $gte: upgradeCost }, // Stone yeterlilik kontrolü
        },
        {
          $inc: {
            'game_data.stones': -upgradeCost,
            'game_data.spent_stone': upgradeCost,
            'game_data.profit_per_hour': profitIncrease,
          },
          $set: {
            'game_data.boosters.$.current_level': nextLevel,
            'game_data.boosters.$.last_upgraded_at': new Date(),
          },
        },
        { new: true },
      );

      if (!updatedUser) {
        // Detaylı hata mesajı için tekrar kontrol
        const userAfterFail = await this.userModel
          .findOne(
            { _id: user_id, 'game_data.boosters.booster_id': booster_id },
            { 'game_data.boosters.$': 1, 'game_data.stones': 1 },
          )
          .lean();

        if (!userAfterFail || !userAfterFail.game_data?.boosters?.[0]) {
          throw new BadRequestException(
            `❌ Booster not found in your inventory.`,
          );
        }

        const currentUserBooster = userAfterFail.game_data.boosters[0];

        // Level değişti mi? (Eş zamanlı upgrade)
        if (currentUserBooster.current_level !== currentLevel) {
          throw new BadRequestException(
            `❌ Booster level changed. Please refresh and try again. (Current: ${currentUserBooster.current_level}, Expected: ${currentLevel})`,
          );
        }

        // Stone yetersiz mi?
        if (userAfterFail.game_data.stones < upgradeCost) {
          throw new BadRequestException(
            `❌ Insufficient stones. You have ${userAfterFail.game_data.stones.toLocaleString()}, but need ${upgradeCost.toLocaleString()}.`,
          );
        }

        throw new BadRequestException(
          `❌ Upgrade failed. Please try again or contact support.`,
        );
      }

      // Güncellenmiş booster bilgisini hazırla (frontend için)
      const updatedBoosterInfo = this.prepareBoosterInfo(
        dbBooster,
        nextLevel,
        true,
      );

      return {
        message: 'Booster upgraded successfully',
        user: updatedUser,
        booster: updatedBoosterInfo, // Frontend'e güncellenmiş booster bilgisi
      };
    } catch (error) {
      console.error('Error in upgradeUserBooster service:', error);
      throw error;
    }
  }

  async unlockUserBooster(user_id: string, booster_id: string) {
    try {
      // Booster verilerini al (cache'lenebilir)
      const booster = await this.boosterModel.findById(booster_id).lean();
      if (!booster) {
        throw new BadRequestException('Booster not found');
      }

      const requirements = booster.unlock_requirements || {};
      const requiredStone = requirements.stone_pay || 0;
      const requiredDust = requirements.dust_pay || 0;
      const requiredMinProfit = requirements.min_profit_per_hour || 0;
      const requiredMinInvites = requirements.min_invite_count || 0;
      const requiredMinSpentStone = requirements.min_spent_stone || 0;
      const requiredMinSpentDust = requirements.min_spent_dust || 0;
      const requiredHiltiLevel = parseInt(
        booster.required_hilti_level.split('_')[1],
      );
      const levelOneProfit = booster.level_data?.[0]?.profit_per_hour || 0;

      // TÜM KONTROLLER VERİTABANI SEVİYESİNDE - TEK ATOMİK İŞLEM
      const updatedUser = await this.userModel.findOneAndUpdate(
        {
          _id: user_id,
          // Booster zaten unlock edilmiş mi kontrolü
          'game_data.boosters.booster_id': { $ne: booster_id },
          // Hilti level kontrolü
          $expr: {
            $gte: [
              {
                $toInt: {
                  $arrayElemAt: [
                    { $split: ['$game_data.hilti_data.hilti', '_'] },
                    1,
                  ],
                },
              },
              requiredHiltiLevel,
            ],
          },
          // Bakiye kontrolleri
          'game_data.stones': { $gte: requiredStone },
          'game_data.dust': { $gte: requiredDust },
          // Kazanım/Harcama kontrolleri
          'game_data.profit_per_hour': { $gte: requiredMinProfit },
          invite_count: { $gte: requiredMinInvites },
          'game_data.spent_stone': { $gte: requiredMinSpentStone },
          'game_data.spent_dust': { $gte: requiredMinSpentDust },
        },
        {
          $inc: {
            'game_data.stones': -requiredStone,
            'game_data.spent_stone': requiredStone,
            'game_data.profit_per_hour': levelOneProfit,
          },
          $push: {
            'game_data.boosters': {
              booster_id: booster_id,
              current_level: 1,
              unlocked_at: new Date(),
            },
          },
        },
        { new: true },
      );

      if (!updatedUser) {
        // Hangi gereksinim karşılanmadığını bulmak için detaylı kontrol
        const userAfterFail = await this.userModel.findById(user_id).lean();
        if (!userAfterFail) {
          throw new BadRequestException('User not found');
        }

        // Detaylı hata mesajları - öncelik sırasına göre
        const isAlreadyUnlocked = userAfterFail.game_data.boosters.some(
          (b) => b.booster_id.toString() === booster_id,
        );
        if (isAlreadyUnlocked) {
          throw new BadRequestException(
            `Booster already unlocked. You already own this booster.`,
          );
        }

        const userHiltiLevel = parseInt(
          userAfterFail.game_data.hilti_data.hilti.split('_')[1],
        );
        if (userHiltiLevel < requiredHiltiLevel) {
          throw new BadRequestException(
            `Hilti level too low. You have Level ${userHiltiLevel}, but need Level ${requiredHiltiLevel}.`,
          );
        }

        if (userAfterFail.game_data.stones < requiredStone) {
          throw new BadRequestException(
            `Insufficient stones. You have ${userAfterFail.game_data.stones.toLocaleString()}, but need ${requiredStone.toLocaleString()}.`,
          );
        }

        if (userAfterFail.game_data.dust < requiredDust) {
          throw new BadRequestException(
            `Insufficient dust. You have ${userAfterFail.game_data.dust.toLocaleString()}, but need ${requiredDust.toLocaleString()}.`,
          );
        }

        if (userAfterFail.game_data.profit_per_hour < requiredMinProfit) {
          throw new BadRequestException(
            `Profit/hour too low. You earn ${userAfterFail.game_data.profit_per_hour.toLocaleString()}/hour, but need ${requiredMinProfit.toLocaleString()}/hour.`,
          );
        }

        if (userAfterFail.invite_count < requiredMinInvites) {
          throw new BadRequestException(
            `Not enough invites. You have ${userAfterFail.invite_count} invites, but need ${requiredMinInvites}.`,
          );
        }

        if (userAfterFail.game_data.spent_stone < requiredMinSpentStone) {
          throw new BadRequestException(
            `Haven't spent enough stones. You've spent ${userAfterFail.game_data.spent_stone.toLocaleString()}, but need ${requiredMinSpentStone.toLocaleString()}.`,
          );
        }

        if (userAfterFail.game_data.spent_dust < requiredMinSpentDust) {
          throw new BadRequestException(
            `Haven't spent enough dust. You've spent ${userAfterFail.game_data.spent_dust.toLocaleString()}, but need ${requiredMinSpentDust.toLocaleString()}.`,
          );
        }

        throw new BadRequestException(
          `Transaction failed. Requirements not met or concurrent modification. Please try again.`,
        );
      }

      // Güncellenmiş booster bilgisini hazırla (frontend için)
      const unlockedBoosterInfo = this.prepareBoosterInfo(booster, 1, true);

      return {
        message: 'Booster unlocked and activated successfully',
        user: updatedUser,
        booster: unlockedBoosterInfo, // Frontend'e güncellenmiş booster bilgisi
      };
    } catch (error) {
      console.error('Error in unlockUserBooster service:', error);
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
