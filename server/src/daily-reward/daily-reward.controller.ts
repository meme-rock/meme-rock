import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { DailyRewardService } from './daily-reward.service';
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';

@Controller('daily-reward')
export class DailyRewardController {
  constructor(private readonly dailyRewardService: DailyRewardService) {}

  @Post('claim/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 2000 } }) // Sadece bu endpoint'te throttling
  async claimDailyReward(@Param('user_id') user_id: string) {
    console.log('Claiming daily reward for user:', user_id);
    return await this.dailyRewardService.claimDailyReward(user_id);
  }
}
