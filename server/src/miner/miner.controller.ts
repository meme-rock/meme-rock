import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { MinerService } from './miner.service';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('miner')
export class MinerController {
  constructor(private readonly minerService: MinerService) {}

  @Post('mine/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 2000 } })
  async mine(@Param('user_id') user_id: string) {
    return await this.minerService.mine(user_id);
  }

  @Post('upgrade-miner/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ strict: { limit: 1, ttl: 2000 } }) // Kritik işlem - sıkı throttling
  async upgradeMiner(@Param('user_id') user_id: string) {
    return await this.minerService.upgrade(user_id);
  }
}
