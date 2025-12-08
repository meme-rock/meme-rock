import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

    await app.listen(process.env.PORT ?? 8080);
    console.log(`✅ Server running on port ${process.env.PORT ?? 8080}`);
  }
}

bootstrap();
