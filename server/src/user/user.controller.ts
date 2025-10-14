import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get('get-user-boosters/:user_id')
  async getUserBoosters(@Param('user_id') user_id: string) {
    return await this.userBoosterService.getUserBoosters(user_id);
  }
}
