import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TonService } from './ton.service';
import {
  PurchaseBoosterDto,
  PurchasePremiumDto,
  PurchaseStonesDto,
} from './dto/ton.dto';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { TonScheduleService } from './ton-schedule.service';

@UseGuards(CustomThrottlerGuard)
@Controller('ton')
export class TonController {
  constructor(private readonly tonService: TonService) {}

  @Post('purchase-booster/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async purchaseBooster(
    @Param('user_id') user_id: string,
    @Body() booster: PurchaseBoosterDto,
  ) {
    return await this.tonService.purchaseBooster(
      user_id,
      booster.booster_id,
      booster.wallet_address,
    );
  }

  @Post('purchase-stones/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async purchaseStones(
    @Param('user_id') user_id: string,
    @Body() stones: PurchaseStonesDto,
  ) {
    return await this.tonService.purchaseStones(
      user_id,
      stones.ton_price,
      stones.wallet_address,
    );
  }

  @Post('purchase-premium/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async purchasePremium(
    @Param('user_id') user_id: string,
    @Body() premium: PurchasePremiumDto,
  ) {
    return await this.tonService.purchasePremium(
      user_id,
      premium.wallet_address,
    );
  }
}

@Controller('ton-schedule')
export class TonScheduleController {
  constructor(private readonly tonScheduleService: TonScheduleService) {}

  @Get('check-ton-payments')
  async checkTonPayments() {
    return await this.tonScheduleService.checkTonPayments();
  }
}
