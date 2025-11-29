import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { ACHIVEMENTS, AchievementItem } from 'src/common/config';

export interface MergedAchievement extends AchievementItem {
  is_claimed: boolean;
  claimed_at?: Date;
}

@Injectable()
export class UserAchivementService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Merges configuration achievements with user's claimed achievements
   * Returns all achievements with their claim status
   */
  returnMergedAchivements(user: UserDocument): MergedAchievement[] {
    try {
      // Get user's claimed achievements
      const userAchievements = user.achievements || [];

      // Get all achievements from config (both INVITE and AD)
      const allConfigAchievements: AchievementItem[] = [
        ...ACHIVEMENTS.INVITE,
        ...ACHIVEMENTS.AD,
      ];

      // Merge config achievements with user's claimed status
      const mergedAchievements: MergedAchievement[] = allConfigAchievements.map(
        (configAchievement) => {
          // Find if user has claimed this achievement
          const userAchievement = userAchievements.find(
            (ua) => ua.id === configAchievement.id,
          );

          return {
            ...configAchievement,
            is_claimed: userAchievement ? true : false,
            claimed_at: userAchievement?.claimed_at,
          };
        },
      );

      return mergedAchievements;
    } catch (error) {
      console.error('Error in returnMergedAchievements:', error);
      // Return empty array on error to prevent crashes
      return [];
    }
  }

  async claimAchievement(user_id: string, achievement_id: string) {
    try {
      // 1. ADIM: Başarım verisini statik config'den al (DB sorgusu yok)
      const isInvite = achievement_id.startsWith('Invite-');
      const achievementConfig = isInvite
        ? ACHIVEMENTS.INVITE.find((a) => a.id === achievement_id) //
        : ACHIVEMENTS.AD.find((a) => a.id === achievement_id); //

      if (!achievementConfig) {
        throw new NotFoundException('ACHIEVEMENT_NOT_FOUND');
      }

      // Gerekli sayıyı ve ödülü al
      const requiredCount = parseInt(achievement_id.split('-')[1]);
      const stoneReward = achievementConfig.stone_reward; //

      // Config'de bir hata varsa (örn: ödül yok, ID bozuk)
      if (isNaN(requiredCount) || typeof stoneReward === 'undefined') {
        throw new InternalServerErrorException('ACHIEVEMENT_CONFIG_ERROR');
      }

      // 2. ADIM: ATOMİK GÜNCELLEMEYİ DENE (İyimser Sorgu)
      // findOneAndUpdate'in 'query' kısmı, tüm şartları KONTROL eder.
      // 'update' kısmı, sadece şartlar sağlanırsa çalışır.
      const updatedUser = await this.userModel.findOneAndUpdate(
        {
          // TEMEL ŞART: Kullanıcıyı bul
          _id: user_id,

          // ŞART 1: Başarım daha önce talep EDİLMEMİŞ olmalı
          // (Sizin kodunuzdaki mantığa göre 'achievements' dizisinde bu ID olmamalı)
          'achievements.id': { $ne: achievement_id },

          // ŞART 2: Gerekli şartı (davet/reklam) sağlıyor olmalı
          ...(isInvite
            ? { invite_count: { $gte: requiredCount } } //
            : { 'ad_data.ads_watched_total': { $gte: requiredCount } }), //
        },
        {
          // GÜNCELLEME 1: Ödülü ver
          $inc: {
            'balance_data.stone': stoneReward, //
          },
          // GÜNCELLEME 2: Başarımı 'talep edildi' olarak kaydet
          $push: {
            achievements: {
              id: achievement_id,
              claimed_at: new Date(),
            },
          },
        },
        {
          new: true, // Güncellenmiş dokümanı döndür
          select: 'balance_data.stone achievements', // Sadece bu alanları seç
        },
      );

      // 3. ADIM: BAŞARI SENARYOSU
      // Eğer 'updatedUser' null değilse, tüm şartlar sağlandı ve güncelleme yapıldı.
      if (updatedUser) {
        console.log(`✅ Achievement claimed: ${user_id} / ${achievement_id}`);
        return {
          success: true,
          achievement_id: achievement_id,
          new_stone_balance: updatedUser.balance_data.stone,
          achievements: updatedUser.achievements,
        };
      }

      // 4. ADIM: HATA SENARYOSU (updatedUser == null)
      // Atomik sorgu başarısız oldu. Şimdi nedenini öğrenmek için 1 kez okuma yap.
      console.warn(`Atomic claim failed for ${user_id}. Diagnosing...`);

      const user = await this.userModel
        .findById(user_id)
        .select('invite_count ad_data.ads_watched_total achievements')
        .lean()
        .exec();

      // Hata Nedeni 1: Kullanıcı bulunamadı
      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      // Hata Nedeni 2: Başarım zaten talep edilmiş
      // (Sizin kodunuzdaki 'some' mantığını kullanıyoruz)
      if (user.achievements?.some((a) => a.id === achievement_id)) {
        throw new BadRequestException('ACHIEVEMENT_ALREADY_CLAIMED');
      }

      // Hata Nedeni 3: Başarım şartı sağlanmamış
      const userCount = isInvite
        ? user.invite_count
        : user.ad_data.ads_watched_total; //
      if (userCount < requiredCount) {
        throw new BadRequestException('ACHIEVEMENT_NOT_COMPLETED');
      }

      // Diğer tüm bilinmeyen nedenler (örn: anlık DB bağlantı hatası)
      throw new InternalServerErrorException('FAILED_TO_CLAIM_UNKNOWN_REASON');
    } catch (error) {
      console.error('Error in claimAchievement:', error);
      // Bizim fırlattığımız bilinen hataları (NotFound, BadRequest vb.) tekrar fırlat
      if (error.status) {
        throw error;
      }
      // Bilinmeyen bir hata oluştu
      throw new InternalServerErrorException('UNEXPECTED_SERVER_ERROR');
    }
  }
}
