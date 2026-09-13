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

        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN is not defined');
        }

        // Webhook'u BURADA kurmuyoruz. Telegraf'ın açılışta setWebhook
        // çağırması, çağrı başarısız olduğunda tüm process'i öldürüyor —
        // ki Cloud Run'da ilk deploy'da servis adresi henüz bilinmediği
        // için bu kilitlenmeye yol açar.
        //
        // Bunun yerine main.ts sunucu dinlemeye başladıktan SONRA
        // webhook'u en iyi çaba ilkesiyle kurar; hata olursa loglanır
        // ve uygulama çalışmaya devam eder.
        return {
          middlewares: [session()],
          token: token,
          polling: false,
          launchOptions: false,
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
