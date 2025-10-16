# 📣 Telegram Broadcast System - Kullanım Kılavuzu

## 🎯 Genel Bakış

Bu sistem, Telegram botunuz aracılığıyla tüm kullanıcılara duyuru göndermek için tasarlanmış profesyonel bir broadcast sistemidir.

## 🚀 Özellikler

- ✅ **Fotoğraf veya Metin** duyurusu
- ✅ **Inline Button** desteği
- ✅ **Önizleme** sistemi
- ✅ **İlerleme takibi** (Progress tracking)
- ✅ **Rate limiting** (Telegram API limitlerini aşmamak için)
- ✅ **Hata yönetimi** (Blocked users, chat not found, vs.)
- ✅ **Detaylı raporlama** (Başarı/başarısız oranları)

## 📝 Kullanım Adımları

### 1. Duyuru Başlatma

Bot'a şu komutu gönderin:

```
/announce
```

### 2. Medya Türü Seçimi

İki seçenek sunulur:

- **Text Only**: Sadece metin duyurusu
- **Fotoğraf**: Fotoğraf + caption gönderebilirsiniz

### 3a. Fotoğraf Gönderme (Opsiyonel)

Eğer fotoğraf seçtiyseniz:

- Fotoğrafı bot'a gönderin
- Caption ekleyebilirsiniz (opsiyonel)

### 3b. Metin Gönderme

Eğer "Text Only" seçtiyseniz:

- Duyuru metnini gönderin

### 4. Buton Ekleme

Buton bilgisini şu formatta gönderin:

```
Button Text | https://example.com
```

**Örnek:**

```
🎮 Oyunu Aç | https://t.me/your_bot/app
```

### 5. Önizleme ve Onay

- Duyurunuzun önizlemesi gösterilir
- Kaç kullanıcıya gönderileceği bilgisi verilir
- **Send Now** butonuna basarak duyuruyu başlatın

### 6. Broadcast Süreci

- Sistem otomatik olarak tüm kullanıcılara mesaj gönderir
- İlerleme raporları alırsınız:
  - `⏳ Progress: 500/2000 (25%)`
  - `⏳ Progress: 1000/2000 (50%)`

### 7. Tamamlanma Raporu

Son olarak detaylı bir özet alırsınız:

```
🏁 Broadcast Completed 🏁

⏱️ Total time: 45.2 seconds
✅ Successful: 1850
❌ Failed: 150
📊 Success rate: %92.50
```

## ⚙️ Teknik Detaylar

### Rate Limiting

- **CHUNK_SIZE**: 500 (Her seferde 500 kullanıcı çekilir)
- **THROTTLE_SIZE**: 29 (Aynı anda 29 mesaj gönderilir)
- **THROTTLE_DELAY**: 1100ms (Her batch arasında bekleme)

Bu ayarlar Telegram API limitlerini aşmamak için optimize edilmiştir.

### Hata Yönetimi

Sistem aşağıdaki hataları otomatik handle eder:

- ❌ Kullanıcı botu engellemiş
- ❌ Chat bulunamadı
- ❌ Diğer Telegram hataları

Bu hatalar loglara kaydedilir ama broadcast'i durdurmaz.

### Markdown Desteği

Mesajlarınızda MarkdownV2 formatı kullanabilirsiniz:

- `*bold*` → **bold**
- `_italic_` → _italic_
- `[link](url)` → clickable link

**Not:** Özel karakterler otomatik olarak escape edilir.

## 🔐 Güvenlik

- Sadece `ADMIN_ID` (5075071123) bu komutları kullanabilir
- Diğer kullanıcılar `/announce` komutunu göremez/kullanamazlar

## 📊 Broadcast Flow

```
/announce
   ↓
Medya Türü Seçimi
   ↓
Fotoğraf/Metin Gönderimi
   ↓
Buton Bilgisi
   ↓
Önizleme
   ↓
Onay (Send Now)
   ↓
Broadcast Başlar
   ↓
İlerleme Raporları
   ↓
Tamamlanma Özeti
```

## 💡 İpuçları

1. **Kısa ve Öz Yazın**: Kullanıcılar uzun mesajları okumayabilir
2. **Call-to-Action Ekleyin**: Buton metnini çekici yapın
3. **Timing**: En aktif saatlerde duyuru gönderin
4. **Test Edin**: İlk önce kendinize test mesajı gönderin

## 🔧 Özelleştirme

### Admin ID Değiştirme

`broadcast.service.ts` dosyasında:

```typescript
private readonly ADMIN_ID = 5075071123; // Buraya kendi Telegram ID'nizi yazın
```

### Rate Limiting Ayarları

```typescript
private readonly CHUNK_SIZE = 500;        // DB'den kaç kullanıcı çekilsin
private readonly THROTTLE_SIZE = 29;      // Aynı anda kaç mesaj
private readonly THROTTLE_DELAY_MS = 1100; // Batch arası bekleme (ms)
```

## ❓ Sorun Giderme

### Duyuru gönderilmiyor

1. Backend'in çalıştığından emin olun
2. Webhook'un doğru yapılandırıldığından emin olun
3. `.env.local` dosyasında gerekli değişkenlerin olduğundan emin olun

### "Permission denied" hatası

- `ADMIN_ID` doğru mu kontrol edin
- Telegram ID'nizi öğrenmek için: `@userinfobot`

### Bazı kullanıcılara ulaşılmıyor

- Normal! Bazı kullanıcılar botu engellemiş olabilir
- Tamamlanma raporunda failed sayısını kontrol edin

## 🎉 Örnek Kullanım

1. Bot'a `/announce` yazın
2. "Text Only" seçin
3. Şu mesajı gönderin:

   ```
   🎮 Yeni özellikler eklendi!

   Hemen dene ve kazanmaya başla!
   ```

4. Buton bilgisini gönderin:
   ```
   🚀 Oyunu Başlat | https://t.me/your_bot/app
   ```
5. "Send Now" butonuna basın
6. Kahvenizi alın ve raporları izleyin! ☕

## 📞 Destek

Herhangi bir sorunuz varsa backend loglarını kontrol edin:

```bash
npm run start:dev
```

Happy Broadcasting! 🎉
