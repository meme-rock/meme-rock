import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserBoosterService } from './user-booster.service';
import { UnlockUserBoosterDto } from './dto/user-boosters.dto';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { BotService } from 'src/bot/bot.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly botService: BotService,
  ) {}

  @Post('loading/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 2000 } }) // Sadece bu endpoint'te throttling
  async loading(
    @Param('user_id') user_id: string,
    @Body() user: CreateUserDto,
  ) {
    return await this.userService.loading(user_id, user);
  }

  @Post('mine-daily-stone-reward/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 2000 } }) // Sadece bu endpoint'te throttling
  async mineDailyStoneReward(@Param('user_id') user_id: string) {
    return await this.userService.mineDailyStoneReward(user_id);
  }
  /**
   * Webhook endpoint for ad providers
   * Example: GET http://localhost:8080/user/ad-reward?userid=123456789&token=meme_rock_ad_secret_2024
   * URL for Adsgram: http://localhost:8080/user/ad-reward?userid=[userId]&token=meme_rock_ad_secret_2024
   */
  @Get('ad-reward')
  @SkipThrottle()
  async adRewardWebhook(
    @Query('userid') userid: string,
    @Query('token') token: string,
    @Query('provider') provider: string,
  ) {
    return await this.userService.adRewardWebhook(userid, token, provider);
  }

  @Get('get-balance-after-ad-reward/:user_id')
  async getBalanceAfterAdReward(@Param('user_id') user_id: string) {
    return await this.userService.getBalanceAfterAdReward(user_id);
  }

  @Post('stone-to-dust-exchange/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ strict: { limit: 1, ttl: 1000 } }) // Kritik işlem - sıkı throttling
  async stoneToDustExchange(
    @Param('user_id') user_id: string,
    @Body() { stones }: { stones: number },
  ) {
    return await this.userService.stoneToDustExchange(user_id, stones);
  }

  @Post('dust-to-stone-exchange/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ strict: { limit: 1, ttl: 1000 } }) // Kritik işlem - sıkı throttling
  async dustToStoneExchange(
    @Param('user_id') user_id: string,
    @Body() { dust }: { dust: number },
  ) {
    return await this.userService.dustToStoneExchange(user_id, dust);
  }

  @Post('refund-stars-payment')
  async refundStarsPayment(
    @Body()
    { telegram_payment_charge_id }: { telegram_payment_charge_id: string },
  ) {
    return await this.botService.testRefundStarsPayment(
      telegram_payment_charge_id,
    );
  }
}

@UseGuards(CustomThrottlerGuard)
@Controller('user-booster')
export class UserBoosterController {
  constructor(private readonly userBoosterService: UserBoosterService) {}

  @Get('get-boosters/:user_id')
  async getBoosters(@Param('user_id') user_id: string) {
    return await this.userBoosterService.loadBoosters(user_id);
  }

  @Post('unlock-booster/:user_id')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  async unlockBooster(
    @Param('user_id') user_id: string,
    @Body() booster: UnlockUserBoosterDto,
  ) {
    return await this.userBoosterService.unlockUserBooster(
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
    return await this.userBoosterService.upgradeUserBooster(
      user_id,
      booster.booster_id,
    );
  }
}
