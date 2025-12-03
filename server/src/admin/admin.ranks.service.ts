import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { getWeeklyPrize } from 'src/common/weekly-prizes.config';
import { User, UserDocument } from 'src/schemas/user.schema';
import { BotService } from 'src/bot/bot.service';
import { HelpersService } from 'src/helpers/helpers.service';

@Injectable()
export class AdminRanksService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly botService: BotService,
    private readonly helpersService: HelpersService,
  ) {}

  //! Reset Weekly Invites Leaderboard
  async resetWeeklyInvites() {
    try {
      console.log('Resetting weekly invite counts...');
      const result = await this.userModel.updateMany(
        { weekly_invite_count: { $gt: 0 } }, // Sadece 0'dan büyük olanları sıfırla
        { $set: { weekly_invite_count: 0 } },
      );
      console.log(`Weekly invites reset for ${result.modifiedCount} users.`);
      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      console.error('Error resetting weekly invites:', error);
      throw error;
    }
  }

  //! Handle Weekly Invites Leaderboard Rewards
  async handleWeeklyInvitesLeaderboardRewards() {
    try {
      console.log('Handling weekly invites leaderboard rewards...');

      const pipeline: PipelineStage[] = [
        {
          // 1. Aşama: Sadece haftalık daveti olanları al (Index kullanır!)
          $match: {
            weekly_invite_count: { $gt: 0 },
          },
        },
        {
          // 2. Aşama: Erken projection (Sadece gereken veriyi sırala)
          $project: {
            _id: 1,
            'telegram_data.username': 1,
            'telegram_data.first_name': 1,
            'telegram_data.photo_url': 1,
            weekly_invite_count: 1, // Sıralama için bu alan gerekli
          },
        },
        {
          // 3. Aşama: Haftalık davet sayısına göre sırala (Index kullanır)
          $sort: {
            weekly_invite_count: -1, // En yüksek davet en üstte
            _id: 1, // Tie-breaker
          },
        },
        {
          // 4. Aşama: İlk 5'i al
          $limit: 5,
        },
        {
          // 5. Aşama: Sıralanmış 5 dökümanı 'items' adlı tek bir diziye al
          $group: {
            _id: null, // Hepsini tek bir grupta topla
            items: { $push: '$$ROOT' }, // $$ROOT = dökümanın kendisi
          },
        },
        {
          // 6. Aşama: Diziye 0-4 arası 'rank' ekleyerek aç
          $unwind: {
            path: '$items',
            includeArrayIndex: 'rank_base_0',
          },
        },
        {
          // 7. Aşama: Dökümanı eski haline getir ve 1-5 arası 'rank' ekle
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$items', // Kullanıcı verisi (örn: _id, telegram_data...)
                { rank: { $add: ['$rank_base_0', 1] } }, // 0+1=1, 4+1=5
              ],
            },
          },
        },
        {
          // 8. Aşama: Final projection -> 'WeeklyInvitesLeaderboardUser' tipine uydur
          $project: {
            _id: '$_id',
            // getTop100'deki ile aynı, sağlam 'username' alma mantığı
            username: {
              $ifNull: [
                {
                  $cond: {
                    if: { $ne: ['$telegram_data.username', ''] },
                    then: '$telegram_data.username',
                    else: null,
                  },
                },
                {
                  $ifNull: [
                    {
                      $cond: {
                        if: { $ne: ['$telegram_data.first_name', ''] },
                        then: '$telegram_data.first_name',
                        else: null,
                      },
                    },
                    '$_id',
                  ],
                },
              ],
            },
            photoUrl: '$telegram_data.photo_url',
            rank: '$rank', // 7. Aşamadan gelen rank
            inviteCount: '$weekly_invite_count', // Bu, haftalık sayaçtır
          },
        },
      ];

      const weeklyInvitesWinners = await this.userModel
        .aggregate(pipeline)
        .exec();
      console.log('Weekly invites winners:', weeklyInvitesWinners);
      for (const winner of weeklyInvitesWinners) {
        const reward = getWeeklyPrize(winner.rank);
        const updatedUser = await this.userModel.findByIdAndUpdate(winner._id, {
          $inc: { 'balance_data.stone': reward },
        });
        console.log(`${winner.username} won ${reward} stones`);
        if (updatedUser) {
          const message = [
            `${this.helpersService.safeMarkdown('🏆')} *Weekly Invites Results*`,
            '',
            `Congratulations *${this.helpersService.safeMarkdown(winner.username)}*\\!`,
            '',
            `${this.helpersService.safeMarkdown('📊')} Rank: *${this.helpersService.safeMarkdown('#' + winner.rank)}*`,
            `${this.helpersService.safeMarkdown('👥')} Invites: *${winner.inviteCount}*`,
            `${this.helpersService.safeMarkdown('💎')} Reward: *${reward} Stones*`,
            '',
            `Your reward has been added to your balance${this.helpersService.safeMarkdown('!')}`,
            `Thank you for growing our community${this.helpersService.safeMarkdown('.')}`,
          ].join('\n');

          await this.botService.sendNotificationToUser(
            Number(winner._id),
            message,
          );
        }
      }
      await this.resetWeeklyInvites();
      return {
        success: true,
        message: 'Weekly invites leaderboard rewards handled successfully',
      };
    } catch (error) {
      console.error('Error in getWeeklyInvitesLeaderboard:', error);
      throw error; // Hatayı 'getLeaderBoard' gibi çağıran fonksiyona geri fırlat
    }
  }
}
