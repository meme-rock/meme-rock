# Canlıya Alma Runbook'u

Client, API, bot webhook ve ödeme mutabakat ucu **tek bir container**'da çalışır.
Kökteki [`Dockerfile`](Dockerfile) client'ı build edip `public/` altına koyar,
`main.ts` orayı bulup SPA'yı yayınlar. Ayrı frontend hosting'e gerek yoktur.

```
                    Cloud Run (us-central1)
                    ┌─────────────────────────────┐
   Telegram ────────▶  tek container, HTTPS 443   │
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
Cloud Run TLS'i kendi sağlar. Ayrı worker container'ına gerek yok; ödeme
mutabakatını Cloud Scheduler tetikler.

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

## Adım 4 — Google Cloud Run

> Koyeb'in ücretsiz planı Mistral satın alımından sonra yeni kullanıcılara
> kapandı. Cloud Run'ın ücretsiz katmanı **her ay sıfırlanır** ve kalıcıdır.
> Oracle VM alternatifi hâlâ geçerli: [`docker-compose.prod.yml`](docker-compose.prod.yml)
> ve [`Caddyfile`](Caddyfile) o yol için repoda duruyor.

### 4a — Proje ve bölge

1. **console.cloud.google.com** → yeni proje: `meme-rock-preview`
2. Faturalandırma hesabı bağla (kart doğrulaması; ücretsiz katmanda ücret çıkmaz)
3. **Bölge: `us-central1` seç.** Bu önemli — ücretsiz 1 GiB/ay çıkış trafiği
   yalnızca Kuzey Amerika bölgelerinden geçerli. Frankfurt'a kurarsan çıkış
   trafiği ilk bayttan itibaren ücretli (~$0.12/GB).

### 4b — Harcama koruması

Üç katmanlı koruma kuruyoruz. Asıl güvence 1 ve 2; spend cap (3) henüz
Preview'da ve herkeste çıkmıyor.

**1) Yapısal sınır — en önemlisi (Adım 4c'de giriliyor)**

Cloud Run servisinde:

| Ayar | Değer | Neden |
|---|---|---|
| Minimum instances | **0** | boştayken hiç ücret yok |
| Maximum instances | **2** | hesaplama maliyetinin tavanı; trafik patlasa bile 2 konteyneri aşmaz |
| CPU allocation | only during request processing | istek yokken CPU saymaz |

Bu, faturanın büyümesini engelleyen asıl mekanizma — Preview özelliğine
bağlı değil, her hesapta çalışır.

**2) Erken uyarı bütçesi — tüm servisler**

Billing → **Budgets & alerts → Create budget**

| Alan | Değer |
|---|---|
| Name | `meme-rock-preview` |
| Time range | Monthly |
| Services | **All services** |
| Savings programs / Other savings | **işaretli kalsın** — böylece bütçe ücretsiz katman kredileri düşüldükten sonraki **net** maliyeti izler |
| Budget type | Specified amount |
| Amount | **₺1** |
| Alert thresholds | 50% / 90% / 100%, Trigger on **Actual** |
| Email alerts to billing admins | ✅ |

Net maliyeti izlediği için, her şey ücretsiz katmandayken hiç tetiklenmez.
Tetiklenirse gerçekten para ödemeye başlamışsın demektir.

**3) Spend cap — varsa kur, yoksa takılma**

Spend cap 27 Temmuz 2026'da **Preview**'a girdi. Seçenek şu koşulların
hepsi sağlanmazsa görünmez:

- Bütçe **tek proje + tek uygun servise** kapsanmış olmalı
  (uygun servisler: Cloud Run, Cloud Run functions, Gemini API, Agent Platform)
- Time range **Monthly** olmalı
- Hesap **birinci taraf** Google Cloud müşterisi olmalı — bayi (reseller)
  üzerinden açılan hesaplar kapsam dışı
- **Billing Account Administrator** rolün olmalı (ya da Project Owner,
  ya da Billing Account Costs Manager + Project Editor)
- Projede o servisin **fiilen kullanımı** olmalı — henüz hiç Cloud Run
  servisi deploy etmediysen seçenek çıkmayabilir

Seçenek, Create Budget akışının **1. adımında** ("Alerts only" / "Spend cap
enforcement" tercihi olarak) çıkar — Actions adımında değil.

> Çıkmıyorsa: önce Adım 4c'yi yapıp Cloud Run servisini deploy et, sonra
> bütçeyi yeniden oluşturmayı dene. Yine çıkmazsa hesabın henüz Preview
> kapsamında değil demektir; 1. ve 2. katman zaten seni koruyor.

### 4c — Servisi deploy et

**Cloud Run → Create service → Continuously deploy from a repository**

1. **Set up with Cloud Build** → GitHub'ı bağla
   - Repo bir organizasyonda (`meme-rock/meme-rock`), Cloud Build'in GitHub
     uygulamasına **organizasyon için** erişim vermen gerekir
2. Repository: `meme-rock/meme-rock` · Branch: `bilal`
3. Build type: **Dockerfile** · Source location: `/Dockerfile`
4. Ayarlar:

| Alan | Değer |
|---|---|
| Region | **us-central1** |
| Authentication | **Allow unauthenticated invocations** |
| CPU allocation | **CPU is only allocated during request processing** |
| Minimum instances | **0** (ücretsiz katman için şart) |
| Maximum instances | **2** (kaza faturasına karşı) |
| Memory | **512 MiB** |
| Container port | **8080** |

5. **Variables & Secrets** → Adım 5'teki değişkenleri gir → **Create**

> Cloud Build'de **machine type'ı değiştirme** — özel makine tipi seçmek
> ücretsiz katmanı tamamen iptal eder. Varsayılanı bırak.

### 4d — Artifact Registry temizlik kuralı (şart)

Ücretsiz depolama **tüm faturalandırma hesabı için 0.5 GB** ve her deploy yeni
bir image yazar. Kural koymazsan birkaç deploy sonra ücret başlar.

**Artifact Registry → `cloud-run-source-deploy` → Cleanup policies → Add**
- Policy type: **Keep most recent versions**
- Keep count: **3**

Eski projelerden kalan image'ları da kontrol et — kota hesap geneli.

### 4e — Webhook adresini bağla

İlk deploy bitince Cloud Run bir adres verir
(`https://meme-rock-xxxxx-uc.a.run.app`). Bunu `TELEGRAM_WEBHOOK_DOMAIN`
değişkenine yaz ve **Edit & deploy new revision** ile yeniden yayınla.

---

## Adım 5 — Ortam değişkenleri

Cloud Run'da **Variables & Secrets** sekmesine tek tek gir.
Tam liste ve açıklamalar: [`.env.production.example`](.env.production.example)
(Oracle VM yolunu seçersen aynı değerleri `.env.production` dosyasına yazarsın.)

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

Ayrı worker yerine **Cloud Scheduler** bu ucu dürtsün (3 iş ücretsiz):

**Cloud Scheduler → Create job**
- Region: `us-central1`
- Frequency: `*/5 * * * *` (5 dakikada bir)
- Target: **HTTP**
- URL: `https://<cloud-run-adresin>/market/check-ton-payments`
- Method: **GET**
- Header: `x-api-key` = `<TON_ENDPOINT_SECRET>`

Anahtarsız istek 401 döner. Ücretsiz alternatif: cron-job.org veya
GitHub Actions `schedule` (en sık 5 dakika).

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

## Maliyet: gerçekten $0 mı?

Bu preview için evet, ama üç şarta bağlı.

| Kalem | Ücretsiz (aylık, sıfırlanır) | Bu projenin kullanımı |
|---|---|---|
| Cloud Run istek | 2.000.000 | binlerce → ✅ |
| Cloud Run CPU | 180.000 vCPU-sn | sıfıra iniyor → ✅ |
| Cloud Run bellek | 360.000 GiB-sn | ✅ |
| Cloud Build | 2.500 dakika | ~5 dk/deploy → 500 deploy → ✅ |
| Cloud Scheduler | 3 iş | 1 iş → ✅ |
| Cloud Logging | 50 GiB | ✅ |
| **Çıkış trafiği** | **1 GiB — yalnız Kuzey Amerika'dan** | ~600 KB/açılış → ~1.700 açılış |
| **Artifact Registry** | **0,5 GB — hesap geneli** | ~55 MB/image |

**Şartlar:**
1. Bölge **us-central1** olmalı — Avrupa'da çıkış trafiği ücretsiz değil
2. Artifact Registry'de **cleanup policy** kurulu olmalı (Adım 4d)
3. **Spend cap** $1'a ayarlı olmalı (Adım 4b) — aşılırsa servis durur, fatura gelmez

Ayda ~1.700 sayfa açılışını aşarsan çıkış trafiği $0,12/GB'den ücretlenir;
5.000 açılış ≈ $0,25. Spend cap bunu da durdurur.

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
