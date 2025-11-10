import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

type LeaderboardUser = {
  _id: string;
  username: string;
  photoUrl: string;
  rank: number;
  airdropCoins: number;
  profitPerHour: number;
  isPremium: boolean;
  minerLevel: number;
  hiltiLevel: number;
  inviteCount: number; // Bu haftaki davet sayısı
};

type LeaderBoardResponse = {
  leaderboard: LeaderboardUser[]; // Top 100 listesi
  currentUserRank: number; // İstek yapan kullanıcının sırası
};

@Injectable()
export class RanksService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getLeaderBoard(currentUserId: string): Promise<LeaderBoardResponse> {
    try {
      // Paralel olarak hem top 100'ü hem de current user rank'ını çekiyoruz
      const [leaderboardResult, currentUserRank] = await Promise.all([
        this.getTop100(),
        this.getCurrentUserRank(currentUserId),
      ]);

      return {
        leaderboard: leaderboardResult,
        currentUserRank: currentUserRank,
      };
    } catch (error) {
      console.error('Error in getLeaderBoard service:', error);
      throw error;
    }
  }

  /**
   * Top 100 kullanıcıyı çeker (rank bilgileriyle birlikte)
   * Index sayesinde ultra hızlı çalışır
   */
  private async getTop100(): Promise<LeaderboardUser[]> {
    const pipeline: PipelineStage[] = [
      {
        // 1. Sadece rock_coins > 0 olanları al (Index kullanır)
        $match: {
          'airdrop_data.rock_coins': { $gt: 0 },
        },
      },
      {
        // 2. Erken projection - Gereksiz veri çekmeyi önler
        $project: {
          _id: 1,
          'telegram_data.username': 1,
          'telegram_data.first_name': 1,
          'telegram_data.photo_url': 1,
          'airdrop_data.rock_coins': 1,
          'airdrop_data.profit_per_hour': 1,
          is_premium: 1,
          invite_count: 1,
          'miner_data.miner': 1,
          'hilti_data.hilti': 1,
        },
      },
      {
        // 3. Puana göre sırala (rockCoinRankSort index'i kullanır - ışık hızında!)
        $sort: {
          'airdrop_data.rock_coins': -1,
          _id: 1, // Tie-breaker
        },
      },
      {
        // 4. İlk 100'ü al
        $limit: 100,
      },
      {
        // 5. Rank ekle (MongoDB 5.0+)
        $setWindowFields: {
          partitionBy: null,
          sortBy: { 'airdrop_data.rock_coins': -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },
      {
        // 6. Final projection - API response formatına dönüştür
        $project: {
          _id: '$_id',
          // Username fallback: username -> first_name -> _id
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
          rank: '$rank',
          airdropCoins: '$airdrop_data.rock_coins',
          profitPerHour: '$airdrop_data.profit_per_hour',
          isPremium: '$is_premium',
          inviteCount: '$invite_count',
          minerLevel: {
            $toInt: {
              $arrayElemAt: [{ $split: ['$miner_data.miner', '_'] }, 1],
            },
          },
          hiltiLevel: {
            $toInt: {
              $arrayElemAt: [{ $split: ['$hilti_data.hilti', '_'] }, 1],
            },
          },
        },
      },
    ];

    return await this.userModel.aggregate(pipeline).exec();
  }

  /**
   * Mevcut kullanıcının rank'ını hesaplar
   * Kendisinden yüksek skorlu kullanıcı sayısını sayar + 1
   * Ultra hızlı - sadece count işlemi (Index kullanır)
   */
  private async getCurrentUserRank(userId: string): Promise<number> {
    // Önce kullanıcının puanını çek
    const currentUser = await this.userModel
      .findById(userId)
      .select('airdrop_data.rock_coins')
      .lean()
      .exec();

    if (!currentUser || currentUser.airdrop_data.rock_coins === 0) {
      return 0; // Puanı yoksa rank 0
    }

    const userScore = currentUser.airdrop_data.rock_coins;

    // Kendisinden yüksek puanlı kullanıcı sayısını say
    // Index sayesinde çok hızlı (rockCoinRankSort index'i)
    const usersAbove = await this.userModel
      .countDocuments({
        'airdrop_data.rock_coins': { $gt: userScore },
      })
      .exec();

    // Rank = kendinden yüksek olanlar + 1
    return usersAbove + 1;
  }
}
