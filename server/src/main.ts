import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { AppModule } from './app.module';
import { SpaFallbackFilter } from './common/filters/spa-fallback.filter';
import { getBotToken } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

function logEnvChecklist() {
  // Değerleri ASLA yazdırma — sadece var/yok.
  const required = ['MONGODB_URI', 'TELEGRAM_BOT_TOKEN'];
  const optional = [
    'REDIS_URL',
    'REDIS_HOST',
    'TELEGRAM_WEBHOOK_DOMAIN',
    'TELEGRAM_WEBHOOK_SECRET',
    'ADMIN_API_KEY',
    'TON_ENDPOINT_SECRET',
    'TON_CONTRACT_ADDRESS',
  ];
  const mark = (k: string) => `${process.env[k] ? '✓' : '✗'} ${k}`;
  console.log('── env ──');
  console.log('  required: ' + required.map(mark).join('  '));
  console.log('  optional: ' + optional.map(mark).join('  '));
  console.log(`  PORT=${process.env.PORT ?? '(unset, defaulting to 8080)'}`);
}

async function bootstrap() {
  logEnvChecklist();
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

    // Webhook'u sunucu DİNLEMEYE BAŞLADIKTAN SONRA kur.
    // Başarısız olursa uygulama çalışmaya devam eder — Cloud Run'da ilk
    // deploy'da servis adresi henüz bilinmez, o yüzden bu adım
    // uygulamanın ayağa kalkmasını engellememelidir.
    await registerTelegramWebhook(bot);
  }
}

async function registerTelegramWebhook(bot: Telegraf) {
  if (process.env.TELEGRAM_WEBHOOK_DISABLED === 'true') {
    console.log('ℹ️  Telegram webhook setup skipped (TELEGRAM_WEBHOOK_DISABLED)');
    return;
  }

  const domain = process.env.TELEGRAM_WEBHOOK_DOMAIN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!domain || !secret) {
    console.warn(
      '⚠️  Telegram webhook not registered: TELEGRAM_WEBHOOK_DOMAIN or ' +
        'TELEGRAM_WEBHOOK_SECRET is missing. The app runs, but the bot will ' +
        'not receive updates until both are set and the service redeployed.',
    );
    return;
  }

  const url = `${domain.replace(/\/$/, '')}/api/updates/${secret}`;

  try {
    await bot.telegram.setWebhook(url, { secret_token: secret });
    console.log(`✅ Telegram webhook registered: ${url}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `⚠️  Telegram webhook registration failed (app still running): ${message}`,
    );
  }
}

bootstrap();
