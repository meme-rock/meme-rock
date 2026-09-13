import { Controller, Post, Body, Get, UseGuards, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';

@Public()
@Controller('throttle-test')
export class ThrottleTestController {
  @Get('default')
  @Throttle({ default: { limit: 1, ttl: 2000 } })
  testDefault() {
    return {
      success: true,
      message: 'Default throttling test - 2 saniyede 1 istek',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('with-telegram-id')
  @Throttle({ default: { limit: 1, ttl: 2000 } })
  testWithTelegramId(@Body() body: { telegram_id: number; message: string }) {
    return {
      success: true,
      message: 'Telegram ID throttling test',
      data: {
        telegram_id: body.telegram_id,
        message: body.message,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('strict')
  @Throttle({ strict: { limit: 1, ttl: 1000 } })
  testStrict() {
    return {
      success: true,
      message: 'Strict throttling test - 1 saniyede 1 istek',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('relaxed')
  @Throttle({ relaxed: { limit: 3, ttl: 5000 } })
  testRelaxed() {
    return {
      success: true,
      message: 'Relaxed throttling test - 5 saniyede 3 istek',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('mixed-test')
  @Throttle({ default: { limit: 1, ttl: 2000 } })
  testMixed(
    @Body() body: { telegram_id?: number; ip?: string; test_data: any },
  ) {
    return {
      success: true,
      message: 'Mixed throttling test - telegram_id ve IP bazlı',
      data: {
        received_telegram_id: body.telegram_id,
        received_ip: body.ip,
        test_data: body.test_data,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('user/:telegram_id')
  @Throttle({ default: { limit: 1, ttl: 2000 } })
  testUserEndpoint(@Param('telegram_id') telegram_id: string) {
    return {
      success: true,
      message: 'URL parametreli throttling test',
      data: {
        telegram_id: telegram_id,
        route: 'GET /throttle-test/user/:telegram_id',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('user/:id/action')
  @Throttle({ default: { limit: 1, ttl: 2000 } })
  testUserAction(
    @Param('id') id: string,
    @Body() body: { action: string; data: any },
  ) {
    return {
      success: true,
      message: 'URL parametreli POST throttling test',
      data: {
        user_id: id,
        action: body.action,
        data: body.data,
        route: 'POST /throttle-test/user/:id/action',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
