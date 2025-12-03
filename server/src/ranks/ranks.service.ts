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
type WeeklyInvitesLeaderboardUser = {
  _id: string;
  username: string;
  photoUrl: string;
  rank: number;
  inviteCount: number; // Bu haftaki davet sayısı
};
type LeaderBoardResponse = {
  leaderboard: LeaderboardUser[] | WeeklyInvitesLeaderboardUser[]; // Top 100 listesi
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
        // 1. Sadece rock_coins > 0 olanları al
        $match: {
          'airdrop_data.rock_coins': { $gt: 0 },
        },
      },
      {
        // 2. Erken projection (Gereksiz veriyi $sort'a taşıma)
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
        // 3. Puana göre sırala (DETERMİNİSTİK - BU ÇOK ÖNEMLİ)
        $sort: {
          'airdrop_data.rock_coins': -1,
          _id: 1, // Tie-breaker
        },
      },
      {
        // 4. İlk 100'ü al
        $limit: 100,
      },

      // --- DEĞİŞİKLİK BURADA BAŞLIYOR ---
      // $setWindowFields'ı kaldırıp yerine 3 aşamalı
      // bir index'leme (numaralandırma) yapıyoruz.

      {
        // 5. Sıralanmış 100 dökümanı 'items' adlı tek bir diziye al
        $group: {
          _id: null, // Hepsini tek bir grupta topla
          items: { $push: '$$ROOT' }, // $$ROOT = dökümanın kendisi
        },
      },
      {
        // 6. Diziye 'includeArrayIndex' ile 0-99 arası 'rank' ekleyerek aç
        $unwind: {
          path: '$items',
          includeArrayIndex: 'rank_base_0', // Yeni alan adı 'rank_base_0' (0-99)
        },
      },
      {
        // 7. Dökümanı eski haline getir ve 1-100 arası 'rank' ekle
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$items', // Kullanıcı verisi (örn: _id, telegram_data...)
              { rank: { $add: ['$rank_base_0', 1] } }, // 0+1=1, 99+1=100
            ],
          },
        },
      },
      // --- DEĞİŞİKLİK BURADA BİTİYOR ---

      {
        // 8. (Eski 6. Aşama) Final projection - API response formatına dönüştür
        // Bu aşama, $replaceRoot'tan gelen 'rank' alanını kullanır.
        $project: {
          _id: '$_id',
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
          rank: '$rank', // <-- 7. Aşamadan gelen yeni 'rank'
          airdropCoins: {
            $toDouble: { $divide: ['$airdrop_data.rock_coins', 100] },
          },
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

  async getWeeklyInvitesLeaderboard(): Promise<WeeklyInvitesLeaderboardUser[]> {
    try {
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
          // 4. Aşama: İlk 100'ü al
          $limit: 100,
        },
        {
          // 5. Aşama: Sıralanmış 100 dökümanı 'items' adlı tek bir diziye al
          $group: {
            _id: null, // Hepsini tek bir grupta topla
            items: { $push: '$$ROOT' }, // $$ROOT = dökümanın kendisi
          },
        },
        {
          // 6. Aşama: Diziye 0-99 arası 'rank' ekleyerek aç
          $unwind: {
            path: '$items',
            includeArrayIndex: 'rank_base_0',
          },
        },
        {
          // 7. Aşama: Dökümanı eski haline getir ve 1-100 arası 'rank' ekle
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$items', // Kullanıcı verisi (örn: _id, telegram_data...)
                { rank: { $add: ['$rank_base_0', 1] } }, // 0+1=1, 99+1=100
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

      return await this.userModel.aggregate(pipeline).exec();
    } catch (error) {
      console.error('Error in getWeeklyInvitesLeaderboard:', error);
      throw error; // Hatayı 'getLeaderBoard' gibi çağıran fonksiyona geri fırlat
    }
  }
}
