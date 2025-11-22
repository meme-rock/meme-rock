import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { HiltiService } from './hilti.service';
import { CustomThrottlerGuard } from 'src/common/guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('hilti')
export class HiltiController {
  constructor(private readonly hiltiService: HiltiService) {}

  @Post('upgrade/:user_id')
  @UseGuards(CustomThrottlerGuard)
  @Throttle({ strict: { limit: 1, ttl: 2000 } }) // Kritik işlem - sıkı throttling
  async upgrade(@Param('user_id') user_id: string) {
    return this.hiltiService.upgrade(user_id);
  }
}
