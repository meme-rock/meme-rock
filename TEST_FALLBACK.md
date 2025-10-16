# 🧪 AdExtra → Adsgram Fallback Testi

## 🚀 Hızlı Test

### Adım 1: Dev Server'ı Başlat

```bash
cd client
npm run dev
```

### Adım 2: Browser Console'u Aç

- F12 veya Cmd+Option+I (Mac)
- Console sekmesi

### Adım 3: Dust Sayfasına Git

- Navbar'dan "Dust" sekmesine tıkla

### Adım 4: Network Status'u Kontrol Et

Console'da şunları görmeli:

```
✅ AdExtra SDK loaded
✅ Adsgram initialized and ready
```

**Her ikisini de gördüysen:** ✅ Sistem hazır!

**Göremediysen:**

- AdExtra yok → `index.html`'de script var mı kontrol et
- Adsgram yok → `.env` dosyasında `VITE_ADSGRAM_BLOCK_ID=16184` olmalı

## 📺 Reklam Gösterme Testleri

### Test 1: AdExtra Reklam Varsa

**Beklenen:**

```
📺 User clicked Watch Ad button
🎯 Status → AdExtra: ✅ | Adsgram: ✅
📺 [STEP 1/2] Trying AdExtra (1s timeout)...
📺 AdExtra: Requesting ad...
✅ AdExtra: Ad completed successfully
🪟 AdExtra opened a window
✅ SUCCESS via AdExtra
✅ Ad completed via adextra
```

**Sonuç:** ✅ AdExtra reklamı göster, Adsgram'a hiç girme

---

### Test 2: AdExtra Reklam Yoksa → Adsgram Fallback

**Beklenen:**

```
📺 User clicked Watch Ad button
🎯 Status → AdExtra: ✅ | Adsgram: ✅
📺 [STEP 1/2] Trying AdExtra (1s timeout)...
📺 AdExtra: Requesting ad...
⚠️ AdExtra: No ads or error
❌ AdExtra: No ads available
🔄 Falling back to Adsgram...
📺 [STEP 2/2] Showing Adsgram...
📺 Adsgram: Showing ad...
✅ Adsgram: Ad completed successfully
✅ SUCCESS via Adsgram
✅ Ad completed via adsgram
```

**Sonuç:** ✅ AdExtra yok, Adsgram göster

---

### Test 3: AdExtra Timeout → Adsgram Fallback

**Beklenen:**

```
📺 User clicked Watch Ad button
🎯 Status → AdExtra: ✅ | Adsgram: ✅
📺 [STEP 1/2] Trying AdExtra (1s timeout)...
📺 AdExtra: Requesting ad...
⏱️ AdExtra: No response (1s timeout) - no ads available
❌ AdExtra: No ads available
🔄 Falling back to Adsgram...
📺 [STEP 2/2] Showing Adsgram...
✅ SUCCESS via Adsgram
```

**Sonuç:** ✅ AdExtra cevap vermiyor (1s), Adsgram göster

---

### Test 4: Alternatif Reklam Gösterimi

**Adımlar:**

1. Butona tıkla → AdExtra veya Adsgram göster
2. Reklamı izle
3. Tekrar tıkla → Diğer network gösterebilir
4. 5 kere tekrar et

**Beklenen:**

- Her tıklamada ya AdExtra ya Adsgram açılmalı
- İki reklam üst üste binmemeli
- Sistem asla kilitlenmemeli

**Sonuç:** ✅ Sistem stabil ve her seferinde çalışıyor

## 🔍 Sorun Giderme

### Sorun 1: "Adsgram initialized" Görünmüyor

**Çözüm:**

```bash
# 1. .env dosyasını kontrol et
cat .env | grep ADSGRAM
# Çıktı: VITE_ADSGRAM_BLOCK_ID=16184

# 2. Dev server'ı yeniden başlat
npm run dev

# 3. Browser cache'i temizle
# Cmd+Shift+R (Mac) veya Ctrl+Shift+R (Windows)
```

---

### Sorun 2: "AdExtra SDK loaded" Görünmüyor

**Çözüm:**

```bash
# index.html'i kontrol et:
grep -A2 "AdExtra" client/index.html

# Şunu görmelisin:
# <!-- AdExtra Script -->
# <script async src="https://partner.adextra.io/jt/4025cd9243581a8ebef45b02737f41d2cbb6f8d2.js"></script>
```

---

### Sorun 3: Adsgram Hiç Gösterilmiyor

**Kontrol Listesi:**

- [ ] `.env` dosyasında `VITE_ADSGRAM_BLOCK_ID=16184` var mı?
- [ ] Console'da "✅ Adsgram initialized" görüyor musun?
- [ ] AdExtra'dan sonra "🔄 Falling back to Adsgram..." görüyor musun?
- [ ] Console'da "📺 [STEP 2/2] Showing Adsgram..." görüyor musun?

**Debug:**

```javascript
// Console'a şunu yaz:
window.Adsgram;
// undefined dönüyorsa SDK yüklenmemiş!
```

---

### Sorun 4: Her Seferinde Sadece AdExtra Gösteriyor

**Sebep:** AdExtra'nın her zaman reklamı var

**Çözüm:** Bu normaldir! AdExtra öncelikli. Eğer AdExtra'da reklam varsa, Adsgram'a geçmez.

**Test etmek için:**

- AdExtra test mode'unu kapat
- veya AdExtra script'ini geçici olarak `index.html`'den yoruma al:
  ```html
  <!-- Temporarily disabled for testing
  <script async src="https://partner.adextra.io/..."></script>
  -->
  ```
- Şimdi sadece Adsgram çalışmalı

---

## 📊 Başarı Kriterleri

### ✅ Sistem Çalışıyor Diyebilirsin Eğer:

1. **Her iki SDK de yüklendi:**

   ```
   ✅ AdExtra SDK loaded
   ✅ Adsgram initialized and ready
   ```

2. **Buton durumu doğru:**

   - "Loading ad..." → "Watch Ad"'e dönüyor
   - Altında "✓ AdExtra ✓ Adsgram" görünüyor

3. **Fallback çalışıyor:**

   - AdExtra yok → Adsgram gösteriyor
   - Console'da "🔄 Falling back to Adsgram..." görünüyor

4. **Sınırsız reklam:**

   - 10 kere tıklayabiliyorsun
   - Her seferinde reklam gösteriyor
   - Sistem kilitlenmiyor

5. **Üst üste binme yok:**
   - İki reklam aynı anda açılmıyor
   - Console'da "🔒 Ad system busy" çalışıyor

## 🎯 Final Checklist

Aşağıdaki testleri yap:

- [ ] AdExtra reklamı gösteriyor
- [ ] Adsgram reklamı gösteriyor
- [ ] AdExtra yok → Adsgram fallback çalışıyor
- [ ] 10 kere üst üste reklam gösterebiliyorum
- [ ] İki reklam üst üste binmiyor
- [ ] Sistem hiç kilitlenmiyor
- [ ] Console log'ları net ve anlaşılır

**Hepsi ✅ ise:** 🎉 Sistem production-ready!

## 📝 Console Log Referansı

### Sıralı Log'lar (Normal Akış):

```
1. ✅ AdExtra SDK loaded
2. ✅ Adsgram initialized and ready
3. 📺 User clicked Watch Ad button
4. 🎯 Status → AdExtra: ✅ | Adsgram: ✅
5. 📺 [STEP 1/2] Trying AdExtra (1s timeout)...
6. 📺 AdExtra: Requesting ad...
7a. (Başarılı) ✅ AdExtra: Ad completed successfully
    → ✅ SUCCESS via AdExtra
7b. (Başarısız) ⚠️ AdExtra: No ads or error
    → 🔄 Falling back to Adsgram...
    → 📺 [STEP 2/2] Showing Adsgram...
    → ✅ SUCCESS via Adsgram
```

## 🚀 Son Notlar

- **1 saniye timeout**: AdExtra hızlıca cevap vermiyor mu? Adsgram devreye giriyor!
- **Akıllı tespit**: Gerçekten reklam açıldı mı kontrol ediliyor
- **Garantili reklam**: En az birinden mutlaka reklam gösteriliyor
- **Production ready**: Gerçek kullanıma hazır!

Başarılar! 🎉
