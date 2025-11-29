import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdService } from './ad.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';

@Controller('ad')
export class AdController {
  constructor(private readonly adService: AdService) {}
  @Get('ad-reward')
  @SkipThrottle()
  async adRewardWebhook(
    @Query('userid') userid: string,
    @Query('token') token: string,
    @Query('provider') provider: string,
  ) {
    return await this.adService.adRewardWebhook(userid, token, provider);
  }

  @Get('get-after-ad-reward/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 1000 } })
  async getAfterAdReward(@Param('user_id') user_id: string) {
    return await this.adService.getAfterAdReward(user_id);
  }
}
