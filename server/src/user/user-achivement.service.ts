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
      const achievement = achievement_id.startsWith('Invite-')
        ? ACHIVEMENTS.INVITE.find((a) => a.id === achievement_id)
        : ACHIVEMENTS.AD.find((a) => a.id === achievement_id);

      if (!achievement) {
        throw new NotFoundException('ACHIEVEMENT_NOT_FOUND');
      }

      // 2. Get user data
      const user = await this.userModel
        .findById(user_id)
        .select(
          'invite_count ad_data.ads_watched achievements balance_data.stone',
        )
        .lean()
        .exec();

      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      // 3. Check if already claimed
      const alreadyClaimed = user.achievements?.some(
        (a) => a.id === achievement_id,
      );

      if (alreadyClaimed) {
        throw new BadRequestException('ACHIEVEMENT_ALREADY_CLAIMED');
      }

      const requiredCount = parseInt(achievement.id.split('-')[1]);
      const canClaim =
        achievement.achievement_type === 'invite'
          ? user.invite_count >= requiredCount
          : user.ad_data.ads_watched >= requiredCount;

      if (!canClaim) {
        throw new BadRequestException('ACHIEVEMENT_NOT_COMPLETED');
      }

      // 4. Claim achievement atomically
      const updatedUser = await this.userModel.findOneAndUpdate(
        {
          _id: user_id,
          'achievements.id': { $ne: achievement_id },
        },
        {
          $push: {
            achievements: {
              id: achievement_id,
              claimed_at: new Date(),
            },
          },
        },
        { new: true, select: 'achievements' },
      );

      if (!updatedUser) {
        throw new InternalServerErrorException('FAILED_TO_UPDATE_USER');
      }
      console.log(`✅ Achievement claimed: ${updatedUser}`);
      return {
        message: 'ACHIEVEMENT_CLAIMED',
        achievement: achievement,
      };
    } catch (error) {
      console.error('Error in claimAchievement:', error);
      throw new InternalServerErrorException('UNEXPECTED_SERVER_ERROR');
    }
  }
}
