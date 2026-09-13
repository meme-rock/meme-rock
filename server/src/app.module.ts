import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TonModule } from './purchases/ton/ton.module';
import { AdminModule } from './admin/admin.module';
import { BotModule } from './bot/bot.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ThrottleTestController } from './common/controllers/throttle-test.controller';
import { MarketModule } from './market/market.module';
import { HelpersModule } from './helpers/helpers.module';
import { MinerModule } from './miner/miner.module';
import { RanksModule } from './ranks/ranks.module';
import { BoosterModule } from './booster/booster.module';
import { StarModule } from './purchases/star/star.module';
import { HiltiModule } from './hilti/hilti.module';
import { TaskModule } from './task/task.module';
import { AdModule } from './ad/ad.module';
import { DailyRewardModule } from './daily-reward/daily-reward.module';
import { MiniGameModule } from './mini-game/mini-game.module';
import { TelegramAuthGuard } from './common/guards/telegram-auth.guard';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

// Bağlantı dizesinde veritabanı adı yoksa Mongoose sessizce varsayılan
// 'test' veritabanına bağlanır ve oyun bomboş açılır. Erkenden ve net patlat.
const mongoDbName = mongoUri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/)?.[1];
if (!mongoDbName) {
  throw new Error(
    "MONGODB_URI must include a database name, e.g. " +
      "mongodb+srv://user:pass@host/meme-rock?retryWrites=true&w=majority " +
      "(without it Mongoose silently uses the 'test' database)",
  );
}
const isWorker = process.env.APP_MODE === 'WORKER';

const commonImports = [
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
      // REDIS_URL verilmişse onu kullan — Upstash gibi yönetilen servisler
      // TLS ve parola ister, bunlar bağlantı dizesinde gelir (rediss://...).
      // Verilmemişse host/port ile lokal Redis'e bağlan.
      storage: (() => {
        const url = config.get<string>('REDIS_URL');
        if (url) {
          return new ThrottlerStorageRedisService(url);
        }
        return new ThrottlerStorageRedisService({
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        });
      })(),
    }),
  }),
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  MongooseModule.forRoot(mongoUri, {
    // Varsayılanda Mongoose sunucu bulunamazsa 30 sn sessizce bekler.
    // Cloud Run bu sırada "konteyner portu dinlemedi" diye deploy'u
    // düşürür ve gerçek sebep loglara hiç yazılmaz. Kısa tutup
    // bağlantı olaylarını logluyoruz ki sebep görünür olsun.
    serverSelectionTimeoutMS: 10000,
    // Nest varsayılanda sonsuz yeniden dener; bu sırada uygulama hiç
    // dinlemeye başlamaz ve Cloud Run "port dinlenmedi" diyerek deploy'u
    // düşürür. Sınırlayıp net bir hatayla çıkmasını sağlıyoruz.
    retryAttempts: 5,
    retryDelay: 3000,
    connectionFactory: (connection) => {
      connection.on('connected', () =>
        console.log('✅ MongoDB connected'),
      );
      connection.on('error', (err: Error) =>
        console.error(`❌ MongoDB connection error: ${err.message}`),
      );
      return connection;
    },
  }),
  HelpersModule,
];

// Worker'ın ÖDEMEYİ İŞLEMESİ için gereken asgari modüller
const workerAppImports = [...commonImports, TonModule];

// Sadece API (Oyun) tarafında çalışacak ağır modüller
const mainAppImports = [
  // Tek servis dağıtımında /ton/purchase-* uçları da API'de bulunsun.
  // Worker ayrı çalıştırılırsa orada da mount edilir, çakışma olmaz.
  TonModule,
  UserModule,
  MinerModule,
  HiltiModule,
  RanksModule,
  StarModule,
  TaskModule,
  AdModule,
  DailyRewardModule,
  MarketModule,
  BoosterModule,
  AdminModule,
  BotModule,
  MiniGameModule,
];

@Module({
  imports: isWorker ? workerAppImports : [...commonImports, ...mainAppImports],
  controllers: [AppController, ThrottleTestController],
  providers: [
    AppService,
    // Oyun uçlarının tamamı Telegram initData doğrulamasından geçer.
    // Muafiyet için @Public() kullanılır (webhook / cron / admin).
    // Worker'da da geçerli: /ton/purchase-* uçları orada mount ediliyor.
    { provide: APP_GUARD, useClass: TelegramAuthGuard },
  ],
})
export class AppModule {}
