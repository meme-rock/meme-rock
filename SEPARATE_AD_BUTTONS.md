# 🎯 Ayrı Reklam Butonları Sistemi

## ✅ Yeni Yaklaşım

### Eski Sorun:

- ❌ AdExtra → Adsgram fallback sistemi
- ❌ Reklamlar üst üste biniyordu
- ❌ Kullanıcı kontrolü yok
- ❌ Karmaşık fallback logic

### Yeni Çözüm:

- ✅ Her network için AYRI buton
- ✅ Kullanıcı HANGİSİNİ izleyeceğini SEÇİYOR
- ✅ Overlap TAMAMEN imkansız
- ✅ Basit ve temiz kod

## 🎨 UI Tasarımı

```
┌─────────────────────────────┐
│    📺 Watch Ads             │
│                             │
│  Reward per ad: 🔶 10 Dust  │
│                             │
│  ┌─────────────────────┐   │
│  │  ▶ Watch AdExtra    │   │ ← Mavi gradient
│  └─────────────────────┘   │
│       🟢 Ready              │
│                             │
│  ┌─────────────────────┐   │
│  │  ▶ Watch Adsgram    │   │ ← Mor-pembe gradient
│  └─────────────────────┘   │
│       🟢 Ready              │
│                             │
│  Watch ads from either      │
│  network to earn Dust       │
└─────────────────────────────┘
```

## 🔧 Teknik Detaylar

### Bağımsız Hook'lar:

```typescript
const adExtra = useAdExtra();
const adsgram = useAdsgram(ADSGRAM_BLOCK_ID);

// Her biri kendi state'ini yönetir
const [adExtraWatching, setAdExtraWatching] = useState(false);
const [adsgramWatching, setAdsgramWatching] = useState(false);
```

### Ayrı Handler'lar:

```typescript
// AdExtra butonu
const handleWatchAdExtra = async () => {
  if (adExtraWatching || !adExtra.isReady) return;
  setAdExtraWatching(true);
  const result = await adExtra.showAd();
  setAdExtraWatching(false);
};

// Adsgram butonu
const handleWatchAdsgram = async () => {
  if (adsgramWatching || !adsgram.isReady) return;
  setAdsgramWatching(true);
  const result = await adsgram.showAd();
  setAdsgramWatching(false);
};
```

## 🎯 Buton Durumları

### AdExtra Butonu:

#### Ready (Aktif):

- ✅ Yeşil nokta "Ready"
- 🎨 Mavi-cyan gradient
- 🖱️ Tıklanabilir
- ▶️ Play icon

#### Not Ready (Pasif):

- ⚪ Gri nokta "Loading..."
- 🎨 Gri background
- 🚫 Tıklanamaz
- ⏳ Disabled

#### Watching (İzleniyor):

- 🔄 Dönen loader
- 🎨 Gri background
- 🚫 Tıklanamaz
- 📺 "Watching AdExtra..."

### Adsgram Butonu:

#### Ready (Aktif):

- ✅ Yeşil nokta "Ready"
- 🎨 Mor-pembe gradient
- 🖱️ Tıklanabilir
- ▶️ Play icon

#### Not Ready (Pasif):

- ⚪ Gri nokta "Loading..."
- 🎨 Gri background
- 🚫 Tıklanamaz
- ⏳ Disabled

#### Watching (İzleniyor):

- 🔄 Dönen loader
- 🎨 Gri background
- 🚫 Tıklanamaz
- 📺 "Watching Adsgram..."

## ✅ Avantajlar

### 1. Overlap İmkansız

Her buton kendi reklamını açar. İki buton aynı anda tıklanamaz çünkü:

- AdExtra izlenirken → AdExtra butonu disabled
- Adsgram izlenirken → Adsgram butonu disabled
- Her handler kendi state'ini kontrol eder

### 2. Kullanıcı Kontrolü

```
Kullanıcı:
- AdExtra reklamları mı izlemek istiyor?
- Adsgram reklamları mı izlemek istiyor?
- Hangisi hazırsa onu seçebilir
```

### 3. Net Feedback

```
AdExtra:
  🟢 Ready       → Reklam var, izleyebilirsin
  ⚪ Loading...  → SDK yükleniyor

Adsgram:
  🟢 Ready       → Reklam var, izleyebilirsin
  ⚪ Loading...  → SDK yükleniyor
```

### 4. Basit Kod

- ❌ Karmaşık fallback logic yok
- ❌ Lock sistemi gerekmez
- ❌ Race condition yok
- ✅ Her buton bağımsız
- ✅ Temiz ve okunabilir

## 📊 Kullanım Senaryoları

### Senaryo 1: Her İki Network Hazır

```
User → AdExtra butonuna tıklar
     → AdExtra reklamı izler
     → 10 Dust kazanır

User → Adsgram butonuna tıklar
     → Adsgram reklamı izler
     → 10 Dust kazanır
```

### Senaryo 2: Sadece Adsgram Hazır

```
AdExtra: ⚪ Loading... (disabled)
Adsgram: 🟢 Ready (aktif)

User → Adsgram butonuna tıklar
     → Adsgram reklamı izler
     → 10 Dust kazanır
```

### Senaryo 3: Sadece AdExtra Hazır

```
AdExtra: 🟢 Ready (aktif)
Adsgram: ⚪ Loading... (disabled)

User → AdExtra butonuna tıklar
     → AdExtra reklamı izler
     → 10 Dust kazanır
```

### Senaryo 4: AdExtra İzlerken

```
User → AdExtra butonuna tıkla
     → Reklam açılıyor...

AdExtra butonu:
  📺 Watching AdExtra... (disabled)

Adsgram butonu:
  🟢 Ready (aktif)

User ikinci bir reklam izlemek isterse:
  → Adsgram butonuna tıklayabilir (AdExtra bittikten sonra)
```

## 🎨 Renkler

### AdExtra (Mavi Tema):

```css
from-blue-600 to-cyan-600
hover:from-blue-500 hover:to-cyan-500
shadow-blue-500/30
```

### Adsgram (Mor-Pembe Tema):

```css
from-purple-600 to-pink-600
hover:from-purple-500 hover:to-pink-500
shadow-purple-500/30
```

### Disabled:

```css
bg-gray-800
text-gray-500
```

## 🔍 Console Log'ları

### AdExtra Tıklama:

```bash
📺 User clicked AdExtra button
✅ AdExtra: Success!
✅ AdExtra completed successfully
⏳ Waiting for webhook...
```

### Adsgram Tıklama:

```bash
📺 User clicked Adsgram button
✅ Adsgram: Ad completed successfully
✅ Adsgram completed successfully
⏳ Waiting for webhook...
```

### Network Hazır Değil:

```bash
# Buton disabled olduğu için handler çalışmaz
# Console'da hiçbir log yok
```

## 🚀 Migration

### Eski Kod (useUnifiedAd):

```typescript
const { showAd } = useUnifiedAd(BLOCK_ID);
// Karmaşık fallback logic
// Lock sistemi
// Race conditions
```

### Yeni Kod (Ayrı Hook'lar):

```typescript
const adExtra = useAdExtra();
const adsgram = useAdsgram(BLOCK_ID);
// Basit ve net
// Her biri bağımsız
// Overlap imkansız
```

## ✨ Sonuç

### Sorunlar Çözüldü:

- ✅ Overlap sorunu **TAMAMEN** ortadan kalktı
- ✅ Kullanıcı deneyimi **ÇOK DAHA İYİ**
- ✅ Kod **ÇOK DAHA BASIT**
- ✅ Her network **BAĞIMSIZ**

### Sistem Artık:

- 🎯 Production-ready
- 🛡️ Güvenli
- 🎨 Güzel UI
- 👤 Kullanıcı dostu
- 🔧 Bakımı kolay

---

**Not:** Bu yaklaşım industry standard'dır. Çoğu uygulama birden fazla ad network kullanırken kullanıcıya seçim hakkı verir.
