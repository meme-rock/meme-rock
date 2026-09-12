import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { AppModule } from './app.module';
import { SpaFallbackFilter } from './common/filters/spa-fallback.filter';
import { getBotToken } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Trust proxy ayarı
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // CORS ayarları
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data'],
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const isWorker = process.env.APP_MODE === 'WORKER';

  if (isWorker) {
    console.log('🔧 WORKER MODE: Starting payment scheduler...');
    // Worker sadece cron job'ları çalıştırır, HTTP dinlemez
    await app.listen(process.env.PORT ?? 8081);
    console.log('✅ Worker initialized - Scheduler is running');
    console.log(`✅ Worker running on port ${process.env.PORT ?? 8081}`);
  } else {
    console.log('🚀 API MODE: Starting game server...');

    // Telegram Bot Webhook Setup
    const bot = app.get<Telegraf>(getBotToken());
    app.use(
      bot.webhookCallback(
        `/api/updates/${process.env.TELEGRAM_WEBHOOK_SECRET}`,
      ),
    );

    // Client'ı aynı servisten yayınla (tek servis dağıtımı).
    // Build edilmiş SPA bulunamazsa sessizce atlanır — client ayrı da
    // dağıtılabilir, bu durumda mevcut davranış değişmez.
    const clientDir = process.env.CLIENT_DIST_PATH
      ? resolve(process.env.CLIENT_DIST_PATH)
      : join(__dirname, '..', 'public');
    const indexHtml = join(clientDir, 'index.html');

    if (existsSync(indexHtml)) {
      app.useStaticAssets(clientDir);
      app.useGlobalFilters(new SpaFallbackFilter(indexHtml));
      console.log(`🖥️  Serving client from ${clientDir}`);
    } else {
      console.log('ℹ️  No client build found — API only');
    }

    await app.listen(process.env.PORT ?? 8080);
    console.log(`✅ Server running on port ${process.env.PORT ?? 8080}`);
  }
}

bootstrap();
