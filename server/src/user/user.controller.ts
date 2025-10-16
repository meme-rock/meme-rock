import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserBoosterService } from './user-booster.service';
import { UnlockUserBoosterDto } from './dto/user-boosters.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('loading/:_id')
  async loading(@Param('_id') _id: string, @Body() user: CreateUserDto) {
    return await this.userService.loading(_id, user);
  }

  /**
   * Webhook endpoint for ad providers
   * Example: GET http://localhost:8080/user/ad-reward?userid=123456789&token=meme_rock_ad_secret_2024
   * URL for Adsgram: http://localhost:8080/user/ad-reward?userid=[userId]&token=meme_rock_ad_secret_2024
   */
  @Get('ad-reward')
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
  async stoneToDustExchange(
    @Param('user_id') user_id: string,
    @Body() { stones }: { stones: number },
  ) {
    return await this.userService.stoneToDustExchange(user_id, stones);
  }

  @Post('dust-to-stone-exchange/:user_id')
  async dustToStoneExchange(
    @Param('user_id') user_id: string,
    @Body() { dust }: { dust: number },
  ) {
    return await this.userService.dustToStoneExchange(user_id, dust);
  }
}

@Controller('user-booster')
export class UserBoosterController {
  constructor(private readonly userBoosterService: UserBoosterService) {}

  @Get('get-boosters/:user_id')
  async getBoosters(@Param('user_id') user_id: string) {
    return await this.userBoosterService.loadBoosters(user_id);
  }

  @Post('unlock-booster/:user_id')
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
