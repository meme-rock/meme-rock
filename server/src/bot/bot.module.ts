// bot.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { BroadcastService } from './jobs/broadcast.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { HelpersModule } from 'src/helpers/helpers.module';
import { BoosterModule } from 'src/booster/booster.module';
import { MarketModule } from 'src/market/market.module';
import { StarModule } from 'src/purchases/star/star.module';

// Ortam değişkeni kontrolü
const isWorker = process.env.APP_MODE === 'WORKER';

@Module({
  imports: [
    // 1. Telegraf Config (Burası standart kalıyor, sadece webhook ayarı dinamik)
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        const secret = configService.get<string>('TELEGRAM_WEBHOOK_SECRET');
        const domain = configService.get<string>('TELEGRAM_WEBHOOK_DOMAIN');
        const hookPath = `/api/updates/${secret}`;

        if (!token || !domain || !secret) {
          throw new Error('TELEGRAM Environment variables missing!');
        }

        // Lokal geliştirmede webhook kurulumunu atla (TELEGRAM_WEBHOOK_DISABLED=true)
        const webhookDisabled =
          configService.get<string>('TELEGRAM_WEBHOOK_DISABLED') === 'true';

        // Worker ise webhook kurma (passive mode)
        const launchOptions =
          isWorker || webhookDisabled
          ? false
          : {
              webhook: {
                hookPath,
                domain,
                secretToken: secret,
              },
            };

        return {
          middlewares: [session()],
          token: token,
          polling: false,
          launchOptions: launchOptions,
        };
      },
    }),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HelpersModule,

    ...(isWorker
      ? []
      : [
          forwardRef(() => BoosterModule),
          forwardRef(() => MarketModule),
          forwardRef(() => StarModule),
        ]),
  ],
  providers: [
    BotService,
    BroadcastService,
    // Eğer Worker ise yükleme, API ise yükle:
    ...(isWorker ? [] : [BotController]),
  ],
  exports: [BotService],
})
export class BotModule {}
