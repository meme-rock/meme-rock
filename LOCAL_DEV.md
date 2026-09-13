# Local Development (Telegram dışında, tarayıcıda çalıştırma)

Oyunu Telegram'a ihtiyaç duymadan lokal MongoDB + Redis ile tarayıcıda çalıştırmak için.

## Ön koşullar

MongoDB ve Redis lokalde çalışıyor olmalı:

```bash
brew services start mongodb-community   # :27017
brew services start redis               # :6379
```

Veritabanı `mongodb://localhost:27017/meme-rock` — miner, hilti, booster, task ve market
verileri seed'li olmalı (yoksa `/admin/create-*` endpoint'lerinden eklenebilir).

## 1. Ortam değişkenleri

`server/.env.local` içinde lokalde webhook kurulumunu kapat — aksi halde Telegraf
gerçek bot'un webhook'unu ayarlamaya çalışır ve ulaşılamayan domain'de süreç çöker:

```
TELEGRAM_WEBHOOK_DISABLED=true
```

`client/.env` API'yi lokale yönlendirsin. Dikkat: `/ton/*` uçları API'de değil
**worker'da** mount ediliyor, bu yüzden iki ayrı port:

```
VITE_API_URL=http://localhost:8080
VITE_TON_URL=http://localhost:8081
```

## 2. Servisleri başlat

```bash
# API (:8080) — oyun uçları, bot webhook
cd server && npx nest start --env-file .env.local --watch

# Worker (:8081) — /ton/purchase-* ve ödeme mutabakatı
cd server && APP_MODE=WORKER PORT=8081 npx nest start --env-file .env.local

# Client (:5173)
cd client && npm run dev
```

## 3. Telegram initData üret ve uygulamayı aç

Uygulama kullanıcı kimliğini `WebApp.initData`'dan okur. Telegram dışında bu veri
olmadığından, bot token'ı ile imzalanmış geçerli bir initData üretip URL hash'ine
koyuyoruz — `@twa-dev/sdk` `#tgWebAppData` parametresini okur.

```bash
cd server
set -a && . ./.env.local && set +a
node ../scripts/gen-initdata.cjs
```

Script `scripts/url.txt` dosyasına tam URL'i yazar; tarayıcıda aç:

```bash
open "$(cat scripts/url.txt)"
```

Demo kullanıcı: `999000111`. Farklı bir kullanıcı için `scripts/gen-initdata.cjs`
içindeki `user` objesini düzenle.

## Notlar

- Auth artık **zorunlu**: `TelegramAuthGuard` global çalışır, imzayı doğrular ve
  rotadaki `:user_id`'nin istek sahibine ait olduğunu kontrol eder. Muaf uçlar
  `@Public()` ile işaretlidir (health, admin, Adsgram webhook, cron).
- Üretilen initData **24 saat** geçerlidir (`auth_date` tazelik kontrolü). Süresi
  dolunca script'i tekrar çalıştırıp yeni URL'i aç.
- TON ödemeleri testnet'e bakar; worker mode (`APP_MODE=WORKER`) sadece ödeme
  kontrolü cron'unu çalıştırır.
- Reklamlar (Adsgram) ve Telegram Stars ödemeleri gerçek Telegram istemcisi
  gerektirir, tarayıcıda çalışmaz.
