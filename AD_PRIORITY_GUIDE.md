# 🎯 Reklam Önceliklendirme Sistemi

## Sistem Mantığı

### 🔄 Çalışma Akışı

```
Kullanıcı "Watch Ad" butonuna tıklar
           ↓
[1] AdExtra'yı dene (2 saniye timeout)
           ↓
    ✅ Başarılı? → AdExtra reklamı göster → BİTTİ
           ↓
    ❌ Başarısız/Timeout?
           ↓
[2] Hemen Adsgram'a geç
           ↓
    ✅ Başarılı? → Adsgram reklamı göster → BİTTİ
           ↓
    ❌ Başarısız? → Hata mesajı
```

## 🛡️ Çakışma Önleme Sistemi

### Üç Katmanlı Koruma:

#### 1. **Component Seviyesi**

```typescript
if (isWatching || !isAdReady) return; // Buton disabled
```

#### 2. **Hook Seviyesi**

```typescript
if (isWatching || isShowingRef.current) {
  console.log("⚠️ Ad already showing, ignoring click");
  return;
}
```

#### 3. **Sequential Execution**

```typescript
// AdExtra önce biter, sonra Adsgram denenir
const adExtraResult = await adExtra.showAd(); // Bekle
if (!adExtraResult) {
  const adsgramResult = await adsgram.showAd(); // Sonra dene
}
```

## ⚡ Hızlı Fallback Sistemi

### AdExtra için 2 Saniye Timeout:

```typescript
setTimeout(() => {
  console.log("⏱️ AdExtra timeout - no response");
  resolve(false); // Hemen Adsgram'a geç
}, 2000);
```

- AdExtra 2 saniye içinde cevap vermezse → Anında Adsgram
- AdExtra hata verirse → Anında Adsgram
- AdExtra reklam yoksa → Anında Adsgram

## 📊 Console Log Örnekleri

### ✅ Başarılı AdExtra:

```
📺 Starting ad...
🎯 Networks - AdExtra: ✅, Adsgram: ✅
📺 [1/2] Trying AdExtra...
✅ AdExtra ad shown
✅ AdExtra success!
✅ Ad completed via adextra
```

### 🔄 AdExtra → Adsgram Fallback:

```
📺 Starting ad...
🎯 Networks - AdExtra: ✅, Adsgram: ✅
📺 [1/2] Trying AdExtra...
⚠️ AdExtra no ads available
⚠️ AdExtra failed, switching to Adsgram...
📺 [2/2] Showing Adsgram...
✅ Adsgram success!
✅ Ad completed via adsgram
```

### ⏱️ AdExtra Timeout → Adsgram:

```
📺 Starting ad...
🎯 Networks - AdExtra: ✅, Adsgram: ✅
📺 [1/2] Trying AdExtra...
⏱️ AdExtra timeout - no response
⚠️ AdExtra failed, switching to Adsgram...
📺 [2/2] Showing Adsgram...
✅ Adsgram success!
```

### ❌ Çift Tıklama Engellendi:

```
📺 Starting ad...
🎯 Networks - AdExtra: ✅, Adsgram: ✅
📺 [1/2] Trying AdExtra...
⚠️ Ad already showing, ignoring click
```

## 🎨 UI Durumları

### Loading ad... (Gri Buton)

- Henüz hiçbir network hazır değil
- Buton disabled
- Loader icon dönüyor

### Watch Ad (Mor-Pembe Buton)

- En az bir network hazır
- Buton aktif
- Play icon görünüyor
- Altında "✓ AdExtra" ve/veya "✓ Adsgram"

### Watching... (Gri Buton)

- Reklam gösteriliyor
- Buton disabled
- Loader icon animasyonlu

## 🔍 Test Senaryoları

### Test 1: Normal Akış (AdExtra Çalışıyor)

1. Sayfa yüklensin
2. "Watch Ad" butonuna tıkla
3. Console'da `[1/2] Trying AdExtra...` gör
4. AdExtra reklamı açılsın
5. Reklam bitince "AdExtra success!" gör

### Test 2: Hızlı Fallback (AdExtra Yok)

1. "Watch Ad" butonuna tıkla
2. Console'da `[1/2] Trying AdExtra...` gör
3. 2 saniye içinde `timeout` veya `no ads` gör
4. Hemen `[2/2] Showing Adsgram...` gör
5. Adsgram reklamı açılsın

### Test 3: Çift Tıklama Testi

1. "Watch Ad" butonuna tıkla
2. Hemen tekrar tıkla
3. Console'da `Ad already showing, ignoring click` gör
4. Sadece bir reklam açılsın

### Test 4: Üst Üste Binme Testi

1. "Watch Ad" butonuna tıkla
2. AdExtra yüklenirken tekrar tıkla
3. İkinci tıklama ignore edilmeli
4. Reklam bittikten sonra tekrar tıkla
5. Yeni bir reklam açılmalı

## 🚀 Optimizasyonlar

### ✅ Yapılan İyileştirmeler:

1. **Hızlı Timeout**: AdExtra için 2 saniye max bekleme
2. **Ref Lock**: `isShowingRef` ile race condition önleme
3. **Sequential Await**: Async/await ile sıralı çalıştırma
4. **State Guards**: Her seviyede koruma katmanı
5. **Clean Logs**: Net ve anlaşılır console mesajları

## 📝 Önemli Notlar

### ⚠️ Dikkat Edilmesi Gerekenler:

1. **AdExtra Timing**: 2 saniye timeout çok kısa gelirse artırılabilir
2. **Webhook Delay**: Ödül webhook'unun gelmesi biraz sürebilir
3. **Test Mode**: AdExtra test mode'da olmalı
4. **Network Status**: Her iki SDK'nın da yüklendiğinden emin ol

### 🔧 Sorun Giderme:

**"AdExtra her zaman timeout oluyor"**

- Timeout süresini 3-5 saniyeye çıkar
- AdExtra SDK'nın yüklendiğini kontrol et

**"Reklamlar hala çakışıyor"**

- Browser cache'i temizle
- Dev server'ı yeniden başlat

**"Hiç reklam gösterilmiyor"**

- `.env` dosyasını kontrol et
- Console'da SDK yükleme log'larını kontrol et

## 🎯 Sonuç

Sistem artık:

- ✅ AdExtra'yı önceliklendirir
- ✅ Hızlıca fallback yapar (2 saniye)
- ✅ Reklamların üst üste binmesini engeller
- ✅ Her tıklamada sadece 1 reklam açar
- ✅ Race condition'ları önler
