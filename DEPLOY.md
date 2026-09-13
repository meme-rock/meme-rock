# Canlıya Alma Runbook'u

Client, API, bot webhook ve ödeme mutabakat ucu **tek bir container**'da çalışır.
Kökteki [`Dockerfile`](Dockerfile) client'ı build edip `public/` altına koyar,
`main.ts` orayı bulup SPA'yı yayınlar. Ayrı frontend hosting'e gerek yoktur.

```
                    Oracle Always Free VM (ARM)
                    ┌─────────────────────────────┐
   Telegram ────────▶  Caddy :443 (Let's Encrypt) │
                    │         ↓                   │
   Mini App         │                             │
                    │  /                → SPA     │
                    │  /profile, /rock… → SPA     │
                    │  /user, /miner…   → API     │
                    │  /ton/purchase-*  → API     │
                    │  /api/updates/…   → webhook │
                    │  /admin/*         → panel   │
                    │  /market/check-…  → cron ucu│
                    └──────┬───────────────┬──────┘
                           │               │
                    MongoDB Atlas     Upstash Redis
```

Tek container: client, API, bot webhook ve ödeme mutabakat ucu aynı process'te.
Caddy önünde TLS sonlandırır. Ayrı worker container'ına gerek yok.

---

## Adım 0 — Başlamadan önce

- [ ] `cd client && npm run build` çalışıyor mu? (geçmeli)
- [ ] `cd server && npm run build` çalışıyor mu? (geçmeli)
- [ ] Üreteceğin iki gizli anahtarı hazırla:

```bash
openssl rand -hex 24   # TELEGRAM_WEBHOOK_SECRET
openssl rand -hex 24   # ADMIN_API_KEY
openssl rand -hex 24   # TON_ENDPOINT_SECRET
```

---

## Adım 1 — MongoDB Atlas (ücretsiz M0)

1. cloud.mongodb.com → hesap aç → **M0 Free** cluster oluştur (bölge: Frankfurt)
2. **Database Access** → kullanıcı oluştur (readWrite)
3. **Network Access** → `0.0.0.0/0` ekle (hosting IP'si sabit değil)
4. **Connect → Drivers** → bağlantı dizesini al:

```
mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/meme-rock?retryWrites=true&w=majority
```

> Veritabanı adını dizenin sonuna (`/meme-rock`) yazmayı unutma.

### Lokal veriyi taşıma (istersen)

Bu projenin **tek** veritabanı var: `meme-rock`. Oyun sunucusu da admin paneli de
onu kullanır (panel doğrudan değil, API üzerinden).

```bash
# yedek al
mongodump --uri="mongodb://localhost:27017/meme-rock" --out=./mrdump

# Atlas'a yükle
mongorestore --uri="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net" \
             --nsFrom="meme-rock.*" --nsTo="meme-rock.*" ./mrdump
```

Sadece oyun konfigürasyonunu taşımak istersen (kullanıcıları değil):

```bash
mongodump --uri="mongodb://localhost:27017/meme-rock" --out=./mrdump \
  --collection=miners --collection=hiltis --collection=boosters \
  --collection=tasks --collection=market_items \
  --collection=minigamecatalogs --collection=minigameconfigs
```

> `tonpayments` koleksiyonunu taşıma — o eski artık veridir. Şema açıkça
> `collection: 'ton_payments'` diyor, uygulama sadece onu okur.

---

## Adım 2 — Upstash Redis (ücretsiz)

1. console.upstash.com → **Create Database**
   - **Name:** `MemeRockPreview`
   - **Primary Region:** Frankfurt (eu-central-1)
   - **Read Regions:** boş bırak (ücretli)
   - **Eviction:** **AÇ** — Redis'te sadece rate-limit sayaçları tutuluyor,
     kaybolmasında sakınca yok. Kapalıyken 256 MB dolarsa yazma hatası
     verir ve istekler patlar; açıkken eski anahtarları atıp çalışmaya devam eder.
2. **Next** → plan ekranında **Free** seç → oluştur
3. Veritabanı sayfasında **Connect → Redis (TCP)** sekmesinden bağlantı
   dizesini kopyala. Şuna benzer:

```
rediss://default:<password>@<endpoint>.upstash.io:6379
```

> ⚠️ `UPSTASH_REDIS_REST_URL` / `REST_TOKEN` değerlerini **kullanma** — onlar
> REST istemcisi için. Proje `ioredis` kullanıyor, TCP dizesi gerekiyor.

Bu dizeyi `REDIS_URL` olarak ver. TLS ve parola dizenin içinde geldiği için
başka ayar gerekmez; `REDIS_HOST` / `REDIS_PORT` girmene gerek yok
(onlar sadece lokal geliştirme içindir).

> Ücretsiz limit 500k komut/ay. Throttler her istekte Redis'e gider, demo
> trafiğinde yeterli.

---

## Adım 3 — Kodu GitHub'a gönder ✅

Repo: **github.com/meme-rock/meme-rock** · Branch: **`bilal`**

```bash
git add .
git commit -m "..."
git push -u origin bilal
```

> Repo `bilalalibindal/meme-rock`'tan `meme-rock/meme-rock` organizasyonuna
> taşınmış. Push hâlâ çalışıyor (GitHub yönlendiriyor) ama uyarıdan kurtulmak
> için remote'u güncelleyebilirsin:
> `git remote set-url origin https://github.com/meme-rock/meme-rock.git`

---

## Adım 4 — Oracle Cloud Always Free sunucusu

> Koyeb'in ücretsiz planı Mistral satın alımından sonra **yeni kullanıcılara
> kapandı**, o yüzden Oracle'ın kalıcı ücretsiz katmanını kullanıyoruz.
> Gerçekten hep açık, uykuya dalmaz, süresi dolmaz.

### 4a — Hesap ve sunucu

1. **cloud.oracle.com** → **Start for free** → hesap aç
   - Kart doğrulaması ister ama **Always Free** kaynaklarda ücret çıkmaz
   - Home Region: **Germany Central (Frankfurt)**
2. **Compute → Instances → Create instance**
   - Image: **Ubuntu 24.04**
   - Shape: **Change shape → Ampere → VM.Standard.A1.Flex**
   - **2 OCPU / 12 GB** (Always Free sınırı — 15 Haziran 2026'da 4/24'ten düşürüldü)
   - SSH: **Paste public key** → `cat ~/.ssh/id_ed25519.pub` çıktısını yapıştır
     (anahtarın yoksa: `ssh-keygen -t ed25519`)
   - **Create**

> **"Out of host capacity"** hatası sık görülür — ARM talebi yüksek. Başka bir
> Availability Domain seç veya birkaç saat sonra tekrar dene.

### 4b — Portları aç (İKİ yerde)

Bu adım atlanırsa site açılmaz; Oracle'ın klasik tuzağı.

**1) Bulut tarafı** — Instance → Subnet → Security List → **Add Ingress Rules**:

| Source CIDR | Protocol | Port |
|---|---|---|
| `0.0.0.0/0` | TCP | 80 |
| `0.0.0.0/0` | TCP | 443 |

**2) Sunucu içi firewall** — Ubuntu imajı 22 dışındaki her şeyi kapatır:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

### 4c — Alan adı (TLS için zorunlu)

Telegram geçerli sertifika ister; Let's Encrypt **çıplak IP'ye sertifika vermez**.
Kendi alan adın yoksa ücretsiz bir tane al:

1. **duckdns.org** → GitHub/Google ile giriş
2. Bir alt alan adı oluştur, örn. `memerock` → `memerock.duckdns.org`
3. **current ip** alanına sunucunun Public IP'sini yaz → **update ip**

Yayıldığını doğrula: `dig +short memerock.duckdns.org`

### 4d — Sunucuyu hazırla

```bash
ssh ubuntu@<PUBLIC_IP>
```

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER && newgrp docker
```

### 4e — Projeyi çek ve çalıştır

```bash
git clone https://github.com/meme-rock/meme-rock.git
cd meme-rock && git checkout bilal
```

```bash
cp .env.production.example .env.production
nano .env.production        # Adım 5'teki değerleri doldur
```

```bash
export DOMAIN=memerock.duckdns.org
echo "DOMAIN=$DOMAIN" >> ~/.bashrc
docker compose -f docker-compose.prod.yml up -d --build
```

İlk build birkaç dakika sürer (ARM üzerinde client + server derleniyor).

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

`🖥️  Serving client from ...` ve `✅ Server running on port 8080` görmelisin.
Caddy sertifikayı otomatik alır; `logs caddy` ile takip edebilirsin.

### 4f — Güncelleme

```bash
cd ~/meme-rock && git pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Adım 5 — Ortam değişkenleri (`.env.production`)

Sunucuda `nano .env.production` ile doldur. Şablon repoda:
[`.env.production.example`](.env.production.example)

```
MONGODB_URI=mongodb+srv://KULLANICI:PAROLA@memerockpreview.kke0p8e.mongodb.net/meme-rock?retryWrites=true&w=majority
REDIS_URL=rediss://default:TOKEN@known-bulldog-179141.upstash.io:6379

TELEGRAM_BOT_TOKEN=<BotFather token>
TELEGRAM_WEBHOOK_DOMAIN=https://memerock.duckdns.org
TELEGRAM_WEBHOOK_SECRET=<openssl rand -hex 24>

ADMIN_API_KEY=<openssl rand -hex 24>
TON_ENDPOINT_SECRET=<openssl rand -hex 24>
AD_WEBHOOK_TOKEN=<adsgram webhook token>

TON_CONTRACT_ADDRESS=kQAUBrVSMxTW6VV3CRqYMBayFcEvwN7MQENBCyjWNPgKqUSt
TON_CENTER_API_KEY=<toncenter.com anahtarı>

APP_MODE=
```

**Girme:** `TELEGRAM_WEBHOOK_DISABLED` — girilmezse Telegraf açılışta webhook'u
kendi kurar. O değişken yalnızca lokal geliştirme içindir.

**Girme:** `VITE_*` — bunlar runtime değil build arg'ıdır ve boş kalmaları gerekir
(client aynı origin'e göreli istek atar, CORS derdi olmaz).

`MONGODB_URI` içinde `/meme-rock` yoksa uygulama açılışta net hata verir —
sessizce boş `test` veritabanına bağlanmaz.

> ⚠️ Telegram webhook yalnızca **443 / 80 / 88 / 8443** portlarında ve geçerli
> sertifikalı HTTPS ile çalışır. Caddy 443'te yayın yapıyor.

---

## Adım 6 — BotFather

1. `@BotFather` → `/mybots` → botun → **Bot Settings → Menu Button**
2. URL: `https://<servis-adresin>`
3. Mini App kullanıyorsan `/newapp` ile app oluştur, aynı URL'i ver

Webhook'un kurulduğunu doğrula:

```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

`"url"` alanı servis adresini göstermeli, `"last_error_message"` boş olmalı.

---

## Adım 7 — Ödeme mutabakat cron'u

Ayrı worker yerine dışarıdan bir cron bu ucu dürtsün:

```
GET  https://<servis-adresin>/market/check-ton-payments
Header:  x-api-key: <TON_ENDPOINT_SECRET>
```

Ücretsiz: **cron-job.org** (dakikalık) veya GitHub Actions `schedule` (min 5 dk).
Anahtarsız istek 401 döner.

---

## Adım 8 — Admin paneli

Panel ayrı bir Next.js projesi (`~/Desktop/meme-rock-panel`), Vercel'e ücretsiz
çıkar. `/admin/*` uçları artık **`x-admin-key` ister**, panelin fetch çağrılarına
bu başlığı eklemen gerekir.

`lib/actions.ts` içindeki 16 fetch çağrısının hepsine ekle:

```ts
headers: {
  "Content-Type": "application/json",
  "x-admin-key": process.env.ADMIN_API_KEY!,
}
```

GET çağrılarında `headers` bloğu hiç yoksa eklemen gerekir.
Panelin env'i:

```
NEXT_PUBLIC_API_URL=https://<servis-adresin>
ADMIN_API_KEY=<sunucudakiyle aynı>
```

> `ADMIN_API_KEY`'i `NEXT_PUBLIC_` yapma — server action'larda kullanılmalı ki
> tarayıcıya sızmasın.

---

## Adım 9 — Doğrulama

```bash
BASE=https://<servis-adresin>

curl -s -o /dev/null -w "SPA        %{http_code}\n"  "$BASE/"
curl -s -o /dev/null -w "SPA route  %{http_code}\n"  "$BASE/profile"
curl -s -o /dev/null -w "auth yok   %{http_code}\n"  -X POST "$BASE/miner/mine/1"
curl -s -o /dev/null -w "admin yok  %{http_code}\n"  "$BASE/admin/get-miners"
curl -s -o /dev/null -w "cron yok   %{http_code}\n"  "$BASE/market/check-ton-payments"
```

Beklenen: `200, 200, 401, 401, 401`

Sonra Telegram'dan Mini App'i aç — önce uyarı modalı, sonra oyun gelmeli.

---

## Akıllı kontratlar

Kontratlar **hiçbir sunucuda barınmaz** — TON testnet'inde deploy edilmiş
durumdalar ve blokzincir üzerinde yaşarlar. Hosting seçimi onları etkilemez;
tek gereken doğru `TON_CONTRACT_ADDRESS` ve bir TON Center API anahtarı.

Kaynak ve testleri bu repoda değil, ayrı Tact projelerinde:
`~/Desktop/TON/TACT/meme-rock-payments` ve `~/Desktop/TON/TACT/purchase-stone`.

---

## Lokal doğrulama (deploy öncesi)

Image'ın yaptığının aynısını elle çalıştır:

```bash
cd client && npm run build
cd ../server && npm run build
rm -rf public && cp -r ../client/dist public
PORT=8099 APP_MODE="" node dist/main
```

Açılışta `🖥️  Serving client from …` satırını görmelisin.
