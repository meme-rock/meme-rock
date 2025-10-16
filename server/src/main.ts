import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { getBotToken } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS ayarlarını etkinleştir
  app.enableCors({
    origin: true, // Tüm origin'lere izin ver (development için)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data'],
  });

  // Validation pipe ekle
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Telegram Bot Webhook Setup
  const bot = app.get<Telegraf>(getBotToken());

  // Express app'i al
  app.use(
    bot.webhookCallback(`/api/updates/${process.env.TELEGRAM_WEBHOOK_SECRET}`),
  );

  await app.listen(process.env.PORT ?? 8080);
  console.log(`Server running on port ${process.env.PORT ?? 8080}`);
}
bootstrap();
