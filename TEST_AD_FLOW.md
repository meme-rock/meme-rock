# 🧪 Reklam Sistemini Test Et

## Hızlı Test Adımları

### 1️⃣ Dev Server'ı Başlat

```bash
cd client
npm run dev
```

### 2️⃣ Browser Console'u Aç

- Chrome/Edge: F12 veya Cmd+Option+I (Mac)
- Console sekmesine geç

### 3️⃣ Test Et

#### ✅ BAŞARILI AKIŞ:

```
Butona tıkla
↓
"📺 [1/2] Trying AdExtra..." göreceksin
↓
AdExtra reklamı açılacak (veya timeout)
↓
Başarısız ise: "📺 [2/2] Showing Adsgram..."
↓
Reklam açılacak
```

#### ❌ ÇİFT TIKLAMA:

```
Butona tıkla
Hemen tekrar tıkla
↓
"⚠️ Ad already showing, ignoring click"
↓
Sadece 1 reklam açılacak
```

## Beklenen Sonuçlar

### Console Log'ları:

```
✅ AdExtra SDK loaded
✅ Adsgram initialized successfully
📺 Starting ad...
🎯 Networks - AdExtra: ✅, Adsgram: ✅
📺 [1/2] Trying AdExtra...
[AdExtra başarılı veya timeout]
📺 [2/2] Showing Adsgram...
✅ Adsgram success!
```

### UI Durumu:

- Başta: "Loading ad..." (gri)
- Yüklendikten sonra: "Watch Ad" (mor-pembe) + "✓ AdExtra ✓ Adsgram"
- Reklam sırasında: "Watching..." (gri, loader)

## ⚠️ Sorun Varsa

1. Console'da hata mesajlarını kopyala
2. Network sekmesinde script yüklenmelerini kontrol et
3. `.env` dosyasını kontrol et: `VITE_ADSGRAM_BLOCK_ID=16184`
