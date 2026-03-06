import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { MiniGameService } from './mini-game.service';
import { EndSessionDto, UpgradeDto } from './dto/mini-game.dto';

@Controller('mini-game')
export class MiniGameController {
  constructor(private readonly miniGameService: MiniGameService) {}

  @Get('catalog')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ relaxed: { limit: 3, ttl: 5000 } })
  async getCatalog() {
    return this.miniGameService.getCatalog();
  }

  @Get('state/:user_id/:game_type')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ relaxed: { limit: 3, ttl: 5000 } })
  async getState(
    @Param('user_id') userId: string,
    @Param('game_type') gameType: string,
  ) {
    return this.miniGameService.getState(userId, gameType);
  }

  @Post('start/:user_id/:game_type')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ strict: { limit: 1, ttl: 2000 } })
  async startSession(
    @Param('user_id') userId: string,
    @Param('game_type') gameType: string,
  ) {
    return this.miniGameService.startSession(userId, gameType);
  }

  @Post('end/:user_id/:game_type')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ strict: { limit: 1, ttl: 2000 } })
  async endSession(
    @Param('user_id') userId: string,
    @Param('game_type') gameType: string,
    @Body() dto: EndSessionDto,
  ) {
    return this.miniGameService.endSession(userId, gameType, {
      rocksSmashed: dto.rocksSmashed,
    });
  }

  @Post('upgrade/:user_id/:game_type')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ strict: { limit: 1, ttl: 2000 } })
  async upgrade(
    @Param('user_id') userId: string,
    @Param('game_type') gameType: string,
    @Body() dto: UpgradeDto,
  ) {
    return this.miniGameService.upgrade(userId, gameType, dto.upgradeId);
  }

  @Post('ad-reward/:user_id/:game_type')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ strict: { limit: 1, ttl: 2000 } })
  async claimAdReward(
    @Param('user_id') userId: string,
    @Param('game_type') gameType: string,
  ) {
    return this.miniGameService.claimAdReward(userId, gameType);
  }
}
