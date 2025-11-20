// bot.module.ts (DÜZELTİLMİŞ VE WEBHOOK UYUMLU VERSİYON)

import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigService eklendi
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
@Module({
  imports: [
    // ⚠️ ÖNEMLİ: ConfigService kullanmak için forRootAsync kullanıyoruz.
    TelegrafModule.forRootAsync({
      imports: [ConfigModule], // ConfigService'i kullanabilmek için ConfigModule'ü import et
      useFactory: (configService: ConfigService) => {
        // Ortam değişkenlerinden gerekli değerleri çekin
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        const secret = configService.get<string>('TELEGRAM_WEBHOOK_SECRET');
        const domain = configService.get<string>('TELEGRAM_WEBHOOK_DOMAIN');

        // Güvenlik için, hookPath'i rastgele SECRET ile oluşturuyoruz
        const hookPath = `/api/updates/${secret}`;

        // Eğer token veya domain yoksa hata fırlat (önlem)
        if (!token || !domain || !secret) {
          throw new Error(
            'TELEGRAM_BOT_TOKEN, DOMAIN veya SECRET ortam değişkenleri eksik!',
          );
        }

        return {
          middlewares: [session()],
          token: token,
          polling: false, // 🛑 Polling'i kapat
          launchOptions: {
            webhook: {
              hookPath: hookPath, // NestJS'in dinleyeceği iç yol
              domain: domain, // Telegram'a bildirilecek dış domain (HTTPS olmalı)
              // Telegram'ın isteği yalnızca doğru gizli yoldan kabul etmesini sağla
              secretToken: secret,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HelpersModule,
    forwardRef(() => BoosterModule),
    forwardRef(() => MarketModule),
    forwardRef(() => StarModule),
  ],
  providers: [BotController, BotService, BroadcastService],
  exports: [BotService],
})
export class BotModule {}
