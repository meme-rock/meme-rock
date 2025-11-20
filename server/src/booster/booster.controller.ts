import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BoosterService } from './booster.service';
import { Throttle } from '@nestjs/throttler';
import { UnlockUserBoosterDto } from './dto/booster.dto';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';

@UseGuards(CustomThrottlerGuard)
@Controller('booster')
export class BoosterController {
  constructor(private readonly boosterService: BoosterService) {}

  @Get('get-boosters/:user_id')
  async getBoosters(@Param('user_id') user_id: string) {
    return await this.boosterService.loadBoosters(user_id);
  }

  @Post('unlock-booster/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async unlockBooster(
    @Param('user_id') user_id: string,
    @Body() booster: UnlockUserBoosterDto,
  ) {
    return await this.boosterService.unlockUserBooster(
      user_id,
      booster.booster_id,
    );
  }

  @Post('upgrade-booster/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async upgradeBooster(
    @Param('user_id') user_id: string,
    @Body() booster: UnlockUserBoosterDto,
  ) {
    return await this.boosterService.upgradeUserBooster(
      user_id,
      booster.booster_id,
    );
  }
}
