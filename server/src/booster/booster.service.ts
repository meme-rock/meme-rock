import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booster, BoosterDocument } from 'src/schemas/booster.schema';
import { Hilti, HiltiDocument } from 'src/schemas/hilti.schema';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { EBoosterUnlockCurrencyType } from 'src/common/enums/boosters.enum';
import { StarMarketItem } from 'src/common/config';
import { BotService } from 'src/bot/bot.service';
import { EPaymentType } from 'src/common/enums/star-payload.enum';

@Injectable()
export class BoosterService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
    @InjectModel(Hilti.name) private hiltiModel: Model<HiltiDocument>,
    @InjectModel(Booster.name) private boosterModel: Model<BoosterDocument>,
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
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
          unlock_options: dbBooster.unlock_options,
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

      const requiredHiltiLevel = parseInt(
        booster.required_hilti_level.split('_')[1],
      );

      const unlockOptions = booster.unlock_options || [];

      // Sadece non-payment option'ları kontrol et (STONE, DUST, INVITE)
      const nonPaymentOptions = unlockOptions.filter(
        (opt) =>
          opt.type === EBoosterUnlockCurrencyType.STONE ||
          opt.type === EBoosterUnlockCurrencyType.DUST ||
          opt.type === EBoosterUnlockCurrencyType.INVITE,
      );

      if (nonPaymentOptions.length === 0) {
        throw new BadRequestException(
          'This booster can only be purchased with TON or STARS. Use purchase endpoint instead.',
        );
      }

      // Tüm gereksinimleri karşılaması gereken bir dizi oluştur
      let currencyType: EBoosterUnlockCurrencyType | undefined;
      let currencyAmount: number = 0;
      let userBalanceField:
        | 'balance_data.stone'
        | 'balance_data.dust'
        | 'invite_count'
        | undefined;

      // Her bir requirement için işlem yap
      const requirements = nonPaymentOptions.map((opt) => {
        let field: 'balance_data.stone' | 'balance_data.dust' | 'invite_count';
        switch (opt.type) {
          case EBoosterUnlockCurrencyType.STONE:
            field = 'balance_data.stone';
            break;
          case EBoosterUnlockCurrencyType.DUST:
            field = 'balance_data.dust';
            break;
          case EBoosterUnlockCurrencyType.INVITE:
            field = 'invite_count';
            break;
          default:
            throw new BadRequestException('Invalid currency type');
        }
        return { type: opt.type, amount: opt.amount, field };
      });

      // İlk requirement'ı alalım (backward compatibility için)
      if (requirements.length > 0) {
        currencyType = requirements[0].type;
        currencyAmount = requirements[0].amount;
        userBalanceField = requirements[0].field;
      }

      const hasCost = requirements.length > 0 && currencyAmount > 0;
      // Level 1 profit (unlock sonrası kazanç)
      const levelOneProfit = booster.level_data?.[0]?.profit_per_hour || 0;

      // Build query conditions
      const queryConditions: any = {
        _id: user_id,
        'boosters.booster': { $nin: [booster_id] }, // Zaten kilidi açılmamış olmalı
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
      };

      // TÜM GEREKSİNİMLER için bakiye kontrolü ekle
      requirements.forEach((req) => {
        if (req.amount > 0) {
          queryConditions[req.field] = { $gte: req.amount };
        }
      });

      // Atomik Güncelleme Operasyonlarını (Update) Oluştur
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

      // SADECE STONE VE DUST için maliyet düşülür, INVITE için düşülmez (sadece kontrol)
      requirements.forEach((req) => {
        if (req.amount > 0 && req.type !== EBoosterUnlockCurrencyType.INVITE) {
          updateOperations.$inc[req.field] = -req.amount;
        }
      });

      // ATOMİK İŞLEM - TÜM KONTROLLER VE GÜNCELLEMELER TEK SORGUDA
      const updatedUser = await this.userModel.findOneAndUpdate(
        queryConditions,
        updateOperations,
        { new: true }, // Güncellenmiş kullanıcı belgesini döndür
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

        // TÜM GEREKSİNİMLER için bakiye kontrolü
        for (const req of requirements) {
          if (req.amount > 0) {
            let userBalance = 0;
            let currencyName = '';

            switch (req.type) {
              case EBoosterUnlockCurrencyType.STONE:
                userBalance = userAfterFail.balance_data.stone || 0;
                currencyName = 'Stone';
                break;
              case EBoosterUnlockCurrencyType.DUST:
                userBalance = userAfterFail.balance_data.dust || 0;
                currencyName = 'Dust';
                break;
              case EBoosterUnlockCurrencyType.INVITE:
                userBalance = userAfterFail.invite_count || 0;
                currencyName = 'Invites';
                break;
            }

            if (userBalance < req.amount) {
              throw new BadRequestException(
                `Insufficient ${currencyName}. Required: ${req.amount.toLocaleString()}, Available: ${userBalance.toLocaleString()}`,
              );
            }
          }
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

  async unlockBoosterForStars(user_id: string, booster_id: string) {
    try {
      const booster = await this.boosterModel.findById(booster_id).lean();
      if (!booster) {
        throw new BadRequestException('Booster not found');
      }
      const levelOneProfit = booster.level_data?.[0]?.profit_per_hour || 0;

      const requiredHiltiLevel = parseInt(
        booster.required_hilti_level.split('_')[1],
      );
      const unlockOptions = booster.unlock_options || [];

      // Sadece payment option'ları kontrol et (STAR, TON) birlite olma
      const paymentOptions = unlockOptions.filter(
        (opt) =>
          opt.type === EBoosterUnlockCurrencyType.STAR ||
          opt.type === EBoosterUnlockCurrencyType.TON,
      );

      if (paymentOptions.length === 0) {
        throw new BadRequestException(
          'Booster requires stars or ton to be purchased',
        );
      }

      const queryConditions: any = {
        _id: user_id,
        'boosters.booster': { $nin: [booster_id] }, // Zaten kilidi açılmamış olmalı
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
      };

      // Atomik Güncelleme Operasyonlarını (Update) Oluştur
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

      const updatedUser = await this.userModel.findOneAndUpdate(
        queryConditions,
        updateOperations,
        { new: true }, // Güncellenmiş kullanıcı belgesini döndür
      );
      if (!updatedUser) {
        this.botService.sendNotificationToUser(
          parseInt(user_id),
          'Failed to unlock booster. Please try again',
        );
        throw new BadRequestException(
          'Failed to unlock booster. Please try again',
        );
      }

      this.botService.sendNotificationToUser(
        parseInt(user_id),
        [
          `✅ *Booster Unlocked\\!*`,
          '',
          `*${booster.title}* Booster has been unlocked successfully`,
        ].join('\n'),
      );
      return true;
    } catch (error) {
      console.error('Error in unlockBoosterForStars:', error);
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
      unlock_options: dbBooster.unlock_options,
      image_url: dbBooster.image_url,
      is_unlocked: isUnlocked,
      current_level: currentLevel,
      level_data: filteredLevelData,
    };
  }

  async createInvoiceLinkForBoosterPurchase(
    user_id: string,
    booster_id: string,
  ) {
    try {
      const user = await this.userModel.findById(user_id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const booster = await this.boosterModel.findById(booster_id).lean();
      if (!booster) {
        throw new NotFoundException('Booster not found');
      }
      const stars_price = booster.unlock_options.find(
        (opt) => opt.type === EBoosterUnlockCurrencyType.STAR,
      )?.amount;
      if (!stars_price) {
        throw new BadRequestException('Booster requires stars to be purchased');
      }
      const payload = JSON.stringify({
        payment_type: EPaymentType.BOOSTER,
        user_id: user_id,
        stars_price: stars_price,
        booster_title: booster.title,
        booster_id: booster_id,
      });
      const prices = [
        {
          label: `${stars_price} Stars`,
          amount: stars_price,
        },
      ];
      const invoice_link = await this.botService.createInvoiceLink(
        `${booster.title} Booster`,
        `Purchase for ${booster.title} Booster for ${stars_price} Stars`,
        payload,
        '',
        prices,
      );
      if (!invoice_link) {
        throw new BadRequestException('Invoice link could not be created');
      }
      return {
        invoice_link: invoice_link,
      };
    } catch (error) {
      console.error('Error in purchaseBoosterWithStars:', error);
      throw error;
    }
  }

  async purchaseBoosterWithTON(user_id: string, booster_id: string) {
    try {
    } catch (error) {}
  }
}
