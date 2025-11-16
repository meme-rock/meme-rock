import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TonModule } from './ton/ton.module';
import { AdminModule } from './admin/admin.module';
import { BotModule } from './bot/bot.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { ThrottleTestController } from './common/controllers/throttle-test.controller';
import { MarketModule } from './market/market.module';
import { HelpersModule } from './helpers/helpers.module';
import { MinerModule } from './miner/miner.module';
import { RanksModule } from './ranks/ranks.module';
import { BoosterModule } from './booster/booster.module';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // 🚨 KRİTİK DÜZELTME: ttl ve limit değerleri 'throttlers' dizisine taşındı.
        throttlers: [
          {
            // Genel API limitleri: 2 saniyede 1 istek
            ttl: 2000,
            limit: 1,
          },
          {
            // Daha sıkı limit: 1 saniyede 1 istek (kritik endpoint'ler için)
            ttl: 1000,
            limit: 1,
            name: 'strict',
          },
          {
            // Daha gevşek limit: 5 saniyede 3 istek (okuma işlemleri için)
            ttl: 5000,
            limit: 3,
            name: 'relaxed',
          },
        ],

        // Diğer ayarlar (storage, skipIf vb.) hala kök objede kalır.
        storage: new ThrottlerStorageRedisService({
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        }),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(mongoUri),
    UserModule,
    MinerModule,
    TonModule,
    AdminModule,
    BotModule,
    MarketModule,
    HelpersModule,
    RanksModule,
    BoosterModule,
  ],
  controllers: [AppController, ThrottleTestController],
  providers: [AppService],
})
export class AppModule {}
