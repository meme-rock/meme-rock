# AdExtra Debug Guide

## 🎯 Son Yapılan Değişiklikler

### 1. **AdExtra Hook İyileştirmesi**

- **Optimistic Approach**: SDK yüklendiğinde varsayılan olarak reklam var kabul ediyor
- **Auto-Recovery**: İlk deneme başarısız olursa 30 saniye sonra tekrar kontrol ediyor
- **Better Logging**: Her adımda detaylı console log'ları

### 2. **Unified Ad System**

- **Öncelik**: AdExtra → Adsgram (fallback)
- **Detaylı Status**: Her iki network'ün durumunu gösteriyor
- **Smart Fallback**: AdExtra başarısız olursa otomatik Adsgram'a geçiyor

## 📊 Console Log'ları

Butona bastığında şu log'ları göreceksin:

### Başarılı AdExtra Akışı:

```
✅ AdExtra SDK loaded - assuming ads are available
🎯 Ad Status - AdExtra: ✅ Ready, Adsgram: ✅ Ready
📺 [PRIORITY] Trying AdExtra first...
📺 Showing AdExtra ad...
✅ AdExtra: Ad completed successfully
```

### AdExtra Başarısız, Adsgram Fallback:

```
✅ AdExtra SDK loaded - assuming ads are available
🎯 Ad Status - AdExtra: ✅ Ready, Adsgram: ✅ Ready
📺 [PRIORITY] Trying AdExtra first...
📺 Showing AdExtra ad...
⚠️ AdExtra: No ads available right now
⚠️ AdExtra failed or no ads available, falling back to Adsgram...
📺 [FALLBACK] Showing Adsgram...
✅ Adsgram ad completed
```

### AdExtra SDK Yüklenmedi:

```
⚠️ AdExtra SDK did not load within 10 seconds
⚠️ AdExtra not ready, falling back to Adsgram...
📺 [FALLBACK] Showing Adsgram...
```

## 🔍 Debug Adımları

### 1. Browser Console'u Aç

- Telegram Web'de: F12 veya Cmd+Option+I
- Console sekmesine git

### 2. SDK Yükleme Kontrolü

- Sayfa yüklendiğinde şu mesajı görmeli:
  ```
  ✅ AdExtra SDK loaded - assuming ads are available
  ```
- Görmüyorsan: AdExtra SDK script'i yüklenmemiş

### 3. Ad Button Durumu

- **Loading ad...**: Henüz hiçbir network hazır değil
- **Watch Ad** + **✓ AdExtra**: AdExtra hazır
- **Watch Ad** + **✓ Adsgram**: Sadece Adsgram hazır

### 4. Butona Basınca

- `🎯 Ad Status` log'unu kontrol et
- `[PRIORITY] Trying AdExtra` görürsen öncelik doğru
- `[FALLBACK] Showing Adsgram` görürsen AdExtra başarısız oldu

## 🛠️ Olası Sorunlar ve Çözümler

### Sorun 1: AdExtra SDK Yüklenmiyor

**Belirtiler:**

- `⚠️ AdExtra SDK did not load within 10 seconds`
- Sadece Adsgram çalışıyor

**Çözüm:**

1. `index.html` dosyasında AdExtra script'inin olduğunu kontrol et
2. Network sekmesinde script'in yüklenip yüklenmediğini kontrol et
3. AdExtra placement div'inin olduğunu kontrol et: `<div id="4025cd9243581a8ebef45b02737f41d2cbb6f8d2"></div>`

### Sorun 2: AdExtra SDK Yüklendi Ama Reklam Göstermiyor

**Belirtiler:**

- `✅ AdExtra SDK loaded`
- `⚠️ AdExtra: No ads available right now`
- Her seferinde Adsgram'a düşüyor

**Çözüm:**

1. **AdExtra Admin Panel**: https://partner.adextra.io
2. **Test Mode**: Test modunun açık olduğundan emin ol
3. **Placement ID**: `4025cd9243581a8ebef45b02737f41d2cbb6f8d2` ID'sinin doğru olduğunu kontrol et
4. **Telegram Bot**: Telegram bot'unun doğru yapılandırıldığını kontrol et

### Sorun 3: Her İki Network de Çalışmıyor

**Belirtiler:**

- `⚠️ No ads available from any network`
- Buton disabled

**Çözüm:**

1. `.env` dosyasını kontrol et: `VITE_ADSGRAM_BLOCK_ID=16184`
2. Dev server'ı yeniden başlat: `npm run dev`
3. Cache'i temizle ve sayfayı yenile

## 📝 Test Senaryoları

### Test 1: Normal Akış (AdExtra Öncelikli)

1. Sayfa yüklensin
2. Console'da `✅ AdExtra SDK loaded` görmeli
3. Buton'a bas
4. `📺 [PRIORITY] Trying AdExtra first...` görmeli
5. AdExtra reklamı gösterilmeli

### Test 2: Fallback Akışı (AdExtra Yok, Adsgram Var)

1. Sayfa yüklensin
2. Buton'a bas
3. `⚠️ AdExtra failed or no ads available, falling back to Adsgram...` görmeli
4. Adsgram reklamı gösterilmeli

### Test 3: Recovery (30 Saniye Sonra Tekrar Dene)

1. AdExtra başarısız olsun
2. 30 saniye bekle
3. `🔄 AdExtra: Re-checking availability...` görmeli
4. Buton'a tekrar bas
5. AdExtra tekrar denenecek

## 🎨 UI Status Indicators

Butonun altında şu göstergeler var:

- **✓ AdExtra**: AdExtra reklamları hazır
- **✓ Adsgram**: Adsgram reklamları hazır
- Her ikisi de yoksa: Hiç gösterge yok

## 📞 Destek

Eğer hala sorun devam ederse:

1. Console log'larının ekran görüntüsünü al
2. Network sekmesinde AdExtra script'inin yüklenip yüklenmediğini kontrol et
3. AdExtra admin panelinden placement ID'yi kontrol et
