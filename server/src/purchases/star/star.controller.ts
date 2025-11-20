import { Controller, Post, Param, UseGuards, Body } from '@nestjs/common';
import { StarService } from './star.service';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { PurchaseBoosterDto, PurchaseStonesDto } from './dto/star.dto';

@UseGuards(CustomThrottlerGuard)
@Controller('star')
export class StarController {
  constructor(private readonly starService: StarService) {}

  @Post('purchase-booster/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async purchaseBooster(
    @Param('user_id') user_id: string,
    @Body() booster: PurchaseBoosterDto,
  ) {
    return await this.starService.purchaseBooster(user_id, booster.booster_id);
  }

  @Post('purchase-stones/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async purchaseStones(
    @Param('user_id') user_id: string,
    @Body() stones: PurchaseStonesDto,
  ) {
    return await this.starService.purchaseStones(user_id, stones.stars_price);
  }
  @Post('purchase-premium/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async purchasePremium(@Param('user_id') user_id: string) {
    return await this.starService.purchasePremium(user_id);
  }
}
