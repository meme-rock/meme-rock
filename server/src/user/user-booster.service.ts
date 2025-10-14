import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Miner, MinerDocument } from 'src/schemas/miner.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { EMinerLevel } from 'src/common/enums/miners.enum';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';
import { Hilti, HiltiDocument } from 'src/schemas/hilti.schema';
import {
  Booster,
  BoosterDocument,
  BoosterUnlockRequirements,
} from 'src/schemas/booster.schema';

@Injectable()
export class UserBoosterService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Miner.name) private minerModel: Model<MinerDocument>,
    @InjectModel(Hilti.name) private hiltiModel: Model<HiltiDocument>,
    @InjectModel(Booster.name) private boosterModel: Model<BoosterDocument>,
  ) {}

  async getAllBoosters() {
    try {
      const boosters = await this.boosterModel.find().exec();
      return boosters;
    } catch (error) {
      console.error('Error in getBoosters service:', error);
      throw error;
    }
  }

  async getUserBoosters(user_id: string) {
    try {
      const user = await this.userModel
        .findById(user_id)
        .populate('game_data.boosters.booster_id')
        .exec();
      return user?.game_data.boosters;
    } catch (error) {
      console.error('Error in getUserBoosters service:', error);
      throw error;
    }
  }
  async loadBoosters(user_id: string) {
    try {
      const userBoosters = await this.getUserBoosters(user_id);
      const dbBoosters = await this.getAllBoosters();

      // 1. Kullanıcının hangi Booster'a kaçıncı seviyede sahip olduğunu tutan Map
      const userBoosterMap = new Map<string, any>();
      userBoosters?.forEach((userBooster) => {
        // Kontrolü daha güvenli hale getirelim
        const populatedBooster = userBooster.booster_id;
        if (
          populatedBooster &&
          typeof populatedBooster === 'object' &&
          '_id' in populatedBooster
        ) {
          const boosterId = (populatedBooster as any)._id.toString();
          userBoosterMap.set(boosterId, {
            current_level: userBooster.current_level,
            // Eğer isterseniz, burada populated Booster verisini de tutabilirsiniz.
          });
        }
      });

      // 2. Verileri Birleştirme ve Filtreleme
      const mergedBoosters = dbBoosters.map((dbBooster) => {
        const boosterId = dbBooster._id.toString();
        const userBoosterData = userBoosterMap.get(boosterId);

        // Bu, frontend'e gönderilecek olan filtrelenmiş level verisidir.
        let filteredLevelData: any[] = [];
        let currentLevel = 0; // Kilitli ise seviye 0

        if (userBoosterData) {
          // Booster KİLİTLİ DEĞİL (is_unlocked: true)
          currentLevel = userBoosterData.current_level;
          const nextLevel = currentLevel + 1;
          const maxLevel = dbBooster.max_level;

          // Sadece mevcut ve bir sonraki seviyenin verisini filtrele
          filteredLevelData = dbBooster.level_data.filter((levelItem) => {
            // Level 0 ve Level 1 için (eğer mevcut seviye 0 ise, level 1'i göster)
            // Ya da Mevcut Seviyeyi (upgrade_cost yok) ve Bir Sonraki Seviyeyi göster
            return (
              levelItem.level === currentLevel ||
              (currentLevel < maxLevel && levelItem.level === nextLevel)
            );
          });
        } else {
          // Booster KİLİTLİ (is_unlocked: false)
          // Sadece Level 1'in verisini göster (Kilit açma maliyetini ve başlangıç kârını görmek için)
          filteredLevelData = dbBooster.level_data.filter(
            (levelItem) => levelItem.level === 1,
          );
        }

        return {
          ...dbBooster.toObject(),
          is_unlocked: !!userBoosterData, // Boolean değer olarak ayarla
          current_level: currentLevel, // Kullanıcının o anki seviyesini ekle
          level_data: filteredLevelData, // FİLİTRELENMİŞ VERİYİ DÖNDÜR
        };
      });

      return mergedBoosters;
    } catch (error) {}
  }
  async checkBoosterRequirements(
    user: UserDocument,
    requirements: BoosterUnlockRequirements,
    required_hilti_level: EHiltiLevel,
  ): Promise<boolean> {
    try {
      // 1. Hilti Level Kontrolü (Hata Mesajı İyileştirildi)
      const user_hilti_level = parseInt(
        user.game_data.hilti_data.hilti.split('_')[1],
      );
      const required_hilti_level_int = parseInt(
        required_hilti_level.split('_')[1],
      );

      if (user_hilti_level < required_hilti_level_int) {
        throw new BadRequestException(
          `Hilti level is too low. Required: ${required_hilti_level} (Level ${required_hilti_level_int})`,
        );
      }

      // 2. Gereksinim ve Kullanıcı Verilerini Çekme
      const reqStone = requirements.stone_pay || 0;
      const reqDust = requirements.dust_pay || 0;
      const reqMinProfit = requirements.min_profit_per_hour || 0;
      const reqMinInvites = requirements.min_invite_count || 0;
      const reqMinSpentStone = requirements.min_spent_stone || 0;
      const reqMinSpentDust = requirements.min_spent_dust || 0;

      const userGameData = user.game_data;

      // 3. Tekil Gereksinim Kontrolleri (Okunabilirlik ve Detaylı Hata Mesajı)

      // Bakiye Kontrolleri
      if (userGameData.stones < reqStone) {
        throw new BadRequestException(
          `Insufficient Stone. Required: ${reqStone.toLocaleString()}`,
        );
      }
      if (userGameData.dust < reqDust) {
        throw new BadRequestException(
          `Insufficient Dust. Required: ${reqDust.toLocaleString()}`,
        );
      }

      // Kazanım/Harcama Kontrolleri
      if (userGameData.profit_per_hour < reqMinProfit) {
        throw new BadRequestException(
          `Total Profit/Hour is too low. Required: ${reqMinProfit.toLocaleString()}`,
        );
      }
      if (user.invite_count < reqMinInvites) {
        throw new BadRequestException(
          `Invite count is too low. Required: ${reqMinInvites}`,
        );
      }

      // Harcanan Miktar Kontrolleri
      if (userGameData.spent_stone < reqMinSpentStone) {
        throw new BadRequestException(
          `Spent Stone amount is too low. Required: ${reqMinSpentStone.toLocaleString()}`,
        );
      }
      if (userGameData.spent_dust < reqMinSpentDust) {
        throw new BadRequestException(
          `Spent Dust amount is too low. Required: ${reqMinSpentDust.toLocaleString()}`,
        );
      }

      // 4. Tüm Gereksinimler Karşılandı
      return true;
    } catch (error) {
      // Fırlatılan BadRequestException'ı yakala ve tekrar fırlat
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Diğer bilinmeyen hataları logla ve genel bir hata fırlat
      console.error('Error in checkBoosterRequirements service:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred during requirement check.',
      );
    }
  }

  // user-booster.service.ts içindeki metodun tamamlanmış hali

  // ... diğer kodlar ...

  async unlockUserBooster(user_id: string, booster_id: string) {
    // try/catch bloğunu sadece atomik işlem başarısız olursa yakalamak için kullanıyoruz.
    try {
      const booster = await this.boosterModel.findById(booster_id);
      if (!booster) {
        throw new BadRequestException('Booster not found');
      }

      // MongoDB'den User dokümanını al
      const user = await this.userModel.findById(user_id);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // 1. Zaten Kilitli mi Kontrolü (Gerekli)
      const isBoosterAlreadyUnlocked = user.game_data.boosters.some(
        (b) => b.booster_id.toString() === booster_id,
      );
      if (isBoosterAlreadyUnlocked) {
        throw new BadRequestException('Booster already unlocked');
      }

      // 2. Gereksinim Kontrolü (Hata atılırsa işlem burada durur)
      // NOT: isRequirementsMet değişkenine ve kontrolüne artık gerek yok,
      // çünkü checkBoosterRequirements hata fırlatır veya başarıyla döner.
      await this.checkBoosterRequirements(
        user,
        booster.unlock_requirements,
        booster.required_hilti_level,
      );

      // --- GÜVENLİ VE ATOMİK İŞLEM BAŞLANGICI ---

      const requiredStone = booster.unlock_requirements?.stone_pay || 0;
      const levelOneProfit = booster.level_data?.[0]?.profit_per_hour || 0;

      const newBoosterEntry = {
        booster_id: booster_id,
        current_level: 1, // Yeni kilit açılan booster level 1'den başlar
        unlocked_at: new Date(),
      };

      // 3. ATOMİK Güncelleme: Stone düş, Booster ekle, Kârı güncelle
      const updatedUser = await this.userModel.findOneAndUpdate(
        {
          _id: user_id,
          // Güvenlik: Harcama işleminden hemen önce DB seviyesinde bakiye kontrolü
          'game_data.stones': { $gte: requiredStone },
        },
        {
          $inc: {
            'game_data.stones': -requiredStone, // Stone'u düş
            'game_data.spent_stone': requiredStone, // Harcanan Stone'u artır
            'game_data.profit_per_hour': levelOneProfit, // Saatlik kâra ekle
          },
          $push: {
            'game_data.boosters': newBoosterEntry, // Envantere ekle
          },
        },
        { new: true }, // Güncel dokümanı döndür
      );

      // 4. Atomik İşlem Başarısızlık Kontrolü
      if (!updatedUser) {
        // Eğer buraya düşerse, genellikle anlık bakiye yetersizliği anlamına gelir.
        throw new BadRequestException(
          'Transaction failed. Insufficient funds or concurrent modification.',
        );
      }

      // 5. Başarı Durumu
      return {
        message: 'Booster unlocked and activated successfully',
        user: updatedUser,
      };
    } catch (error) {
      // Hata yakalama: BadRequest veya InternalServerError'ı tekrar fırlatır
      console.error('Error in unlockUserBooster service:', error);
      throw error;
    }
  }
}
