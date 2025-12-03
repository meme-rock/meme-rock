import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { DAILY_REWARD } from 'src/common/config';

interface BalanceData {
  stone: number;
  dust: number;
}

export interface DailyRewardData {
  day: number;
  last_claim_date: string;
}

export interface DailyRewardResponse {
  daily_reward_data: DailyRewardData;
  balance: BalanceData;
}

@Injectable()
export class DailyRewardService {
  private static readonly CYCLE_START_HOUR_UTC = 8;
  private static readonly MAX_REWARD_DAY = 10;
  private static readonly MS_PER_DAY = 1000 * 60 * 60 * 24;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Günlük ödül döngüsünün başlangıç zamanını hesaplar (UTC 08:00)
   */
  private getCurrentCycleStart(): Date {
    const now = new Date();
    const cycleStart = new Date(now);
    cycleStart.setUTCHours(DailyRewardService.CYCLE_START_HOUR_UTC, 0, 0, 0);

    if (now < cycleStart) {
      cycleStart.setUTCDate(cycleStart.getUTCDate() - 1);
    }

    return cycleStart;
  }

  /**
   * Streak takibi için oyun günü ID'sini hesaplar
   */
  private getGameDayId(date: Date): number {
    const adjustedDate = new Date(date);
    adjustedDate.setUTCHours(
      adjustedDate.getUTCHours() - DailyRewardService.CYCLE_START_HOUR_UTC,
    );
    return Math.floor(adjustedDate.getTime() / DailyRewardService.MS_PER_DAY);
  }

  /**
   * Bir sonraki sıfırlama zamanını hesaplar
   */
  private getNextResetDate(): Date {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setUTCHours(DailyRewardService.CYCLE_START_HOUR_UTC, 0, 0, 0);

    if (now >= nextReset) {
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    }

    return nextReset;
  }

  /**
   * Kullanıcının bir sonraki ödül gününü hesaplar
   */
  private calculateNextRewardDay(
    lastClaimDate: Date | null,
    currentDay: number | null,
    currentDayId: number,
  ): number {
    if (!lastClaimDate || !currentDay) {
      return 1; // İlk kez alıyor
    }

    const lastDayId = this.getGameDayId(lastClaimDate);
    const dayDiff = currentDayId - lastDayId;

    if (dayDiff === 1) {
      // Seri devam ediyor
      const nextDay = currentDay + 1;
      return nextDay > DailyRewardService.MAX_REWARD_DAY ? 1 : nextDay;
    }

    // Seri bozuldu, başa dön
    return 1;
  }

  /**
   * Günlük ödülü talep eder - Atomic işlem ile
   */
  async claimDailyReward(userId: string): Promise<DailyRewardResponse> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const cycleStart = this.getCurrentCycleStart();
    const now = new Date();
    const currentDayId = this.getGameDayId(now);

    // First, read the user (only required fields)
    const user = await this.userModel
      .findOne(
        {
          _id: userId,
          $or: [
            { daily_reward_data: { $exists: false } },
            { 'daily_reward_data.last_claim_date': { $lt: cycleStart } },
          ],
        },
        {
          daily_reward_data: 1,
          is_premium: 1,
          'balance_data.stone': 1,
          'balance_data.dust': 1,
          'miner_data.miner': 1,
        },
      )
      .lean();

    if (!user) {
      const nextReset = this.getNextResetDate();
      throw new BadRequestException(
        `You have already claimed today's reward. Next reward: ${nextReset.toISOString()}`,
      );
    }
    const minerLevel = Number(user.miner_data.miner.split('_')[1]);

    // Calculate next reward day
    const lastClaimDate = user.daily_reward_data?.last_claim_date
      ? new Date(user.daily_reward_data.last_claim_date)
      : null;
    const currentDay = user.daily_reward_data?.day ?? null;
    const nextRewardDay = this.calculateNextRewardDay(
      lastClaimDate,
      currentDay,
      currentDayId,
    );

    // Get reward configuration
    const rewardConfig = DAILY_REWARD.find((r) => r.day === nextRewardDay);
    if (!rewardConfig) {
      throw new BadRequestException(`Invalid reward day: ${nextRewardDay}`);
    }

    const { reward: rewardStone, dust_price: requiredDust } = rewardConfig;

    // Dust check for non-premium users
    const currentDust = user.balance_data?.dust ?? 0;
    if (!user.is_premium && currentDust < requiredDust) {
      throw new BadRequestException(
        `Insufficient Dust. Required: ${requiredDust}, Current: ${currentDust}`,
      );
    }

    // Atomic update işlemi - Tek sorguda her şeyi güncelle
    const updateQuery: any = {
      $set: {
        'daily_reward_data.day': nextRewardDay,
        'daily_reward_data.last_claim_date': now,
      },
      $inc: {
        'balance_data.stone': rewardStone * minerLevel,
      },
    };

    // Premium değilse dust düş
    if (!user.is_premium) {
      updateQuery.$inc['balance_data.dust'] = -requiredDust;
    }

    // FindOneAndUpdate ile atomic güncelleme
    const updatedUser = await this.userModel.findOneAndUpdate(
      {
        _id: userId,
        $or: [
          { daily_reward_data: { $exists: false } },
          { 'daily_reward_data.last_claim_date': { $lt: cycleStart } },
        ],
        // Aynı anda başka bir istek gelirse önlemek için tekrar kontrol
        ...(user.is_premium
          ? {}
          : { 'balance_data.dust': { $gte: requiredDust } }),
      },
      updateQuery,
      {
        new: true, // Güncellenmiş dokümanı döndür
        projection: {
          'balance_data.stone': 1,
          'balance_data.dust': 1,
          'daily_reward_data.day': 1,
          'daily_reward_data.last_claim_date': 1,
        },
      },
    );

    // Race condition kontrolü
    if (!updatedUser) {
      throw new BadRequestException('Reward claim failed. Please try again.');
    }

    return {
      daily_reward_data: {
        day: updatedUser.daily_reward_data.day,
        last_claim_date: new Date(
          updatedUser.daily_reward_data.last_claim_date,
        ).toISOString(),
      },
      balance: {
        stone: updatedUser.balance_data?.stone ?? 0,
        dust: updatedUser.balance_data?.dust ?? 0,
      },
    };
  }
}
