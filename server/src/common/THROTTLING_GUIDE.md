# 🔒 Özelleştirilmiş Throttling Sistemi - Kullanım Kılavuzu

## 🎯 Genel Bakış

Sistemimiz artık **Telegram ID** ve **IP adresi** bazlı throttling kullanıyor. Bu sayede aynı kullanıcıdan veya aynı cihazdan gelen istekleri daha etkili bir şekilde sınırlayabiliyoruz.

## 🚀 Özellikler

- ✅ **Telegram ID bazlı throttling** (öncelikli)
- ✅ **IP adresi bazlı throttling** (fallback)
- ✅ **Özelleştirilmiş hata mesajları** (Türkçe)
- ✅ **Detaylı response bilgileri**
- ✅ **Çoklu throttling seviyeleri**
- ✅ **Redis tabanlı storage**

## 📊 Throttling Seviyeleri

| Seviye      | Limit   | TTL      | Kullanım                          |
| ----------- | ------- | -------- | --------------------------------- |
| **default** | 1 istek | 2 saniye | Genel API endpoint'leri           |
| **strict**  | 1 istek | 1 saniye | Kritik işlemler (ödeme, exchange) |
| **relaxed** | 3 istek | 5 saniye | Okuma işlemleri                   |

## 🔍 Throttling Mantığı

### 1. Identifier Belirleme

```typescript
// Öncelik sırası:
1. telegram_id (request body'den)
2. X-Telegram-ID header'ı
3. telegram_id query parameter
4. IP adresi (fallback)
```

### 2. Redis Key Formatı

```
telegram_123456789    // Telegram ID varsa
ip_192.168.1.1       // IP adresi fallback
```

## 📝 Kullanım Örnekleri

### Temel Kullanım (Default Throttling)

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('user')
export class UserController {
  @Post('login')
  @Throttle({ default: { limit: 1, ttl: 2000 } })
  async login(@Body() body: { telegram_id: number }) {
    // 2 saniyede 1 istek limiti
    return { success: true, user_id: body.telegram_id };
  }
}
```

### Strict Throttling (Kritik İşlemler)

```typescript
@Post('exchange')
@Throttle({ strict: { limit: 1, ttl: 1000 } })
async exchange(@Body() body: { telegram_id: number; amount: number }) {
  // 1 saniyede 1 istek limiti - daha sıkı
  return { success: true, exchanged: body.amount };
}
```

### Relaxed Throttling (Okuma İşlemleri)

```typescript
@Get('profile')
@Throttle({ relaxed: { limit: 3, ttl: 5000 } })
async getProfile(@Body() body: { telegram_id: number }) {
  // 5 saniyede 3 istek limiti - daha gevşek
  return { success: true, profile: userData };
}
```

## 🧪 Test Endpoint'leri

Sisteminizi test etmek için aşağıdaki endpoint'leri kullanabilirsiniz:

### 1. Default Throttling Test

```bash
GET /throttle-test/default
```

### 2. Telegram ID Test

```bash
POST /throttle-test/with-telegram-id
Content-Type: application/json

{
  "telegram_id": 123456789,
  "message": "Test mesajı"
}
```

### 3. Strict Throttling Test

```bash
GET /throttle-test/strict
```

### 4. Relaxed Throttling Test

```bash
GET /throttle-test/relaxed
```

### 5. Mixed Test

```bash
POST /throttle-test/mixed-test
Content-Type: application/json

{
  "telegram_id": 123456789,
  "test_data": "Herhangi bir veri"
}
```

## 📊 Response Formatları

### Başarılı Response

```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": { ... },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Throttling Response (429)

```json
{
  "success": false,
  "message": "Çok fazla istek gönderdiniz. Lütfen bekleyin.",
  "error": "TOO_MANY_REQUESTS",
  "statusCode": 429,
  "details": {
    "limit": "2 saniyede 1 istek",
    "retryAfter": 1,
    "identifier": "telegram_id: 123456789",
    "hits": 2
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 Frontend Entegrasyonu

### Telegram ID'yi Gönderme

```typescript
// Frontend'de API isteği
const response = await fetch('/api/user/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    telegram_id: userTelegramId,
    // diğer veriler...
  }),
});
```

### Hata Handling

```typescript
try {
  const response = await fetch('/api/endpoint', { ... });
  const data = await response.json();

  if (!response.ok && response.status === 429) {
    // Throttling hatası
    console.log('Çok fazla istek:', data.details.retryAfter);
    // Kullanıcıya bekleme süresini göster
  }
} catch (error) {
  console.error('API Error:', error);
}
```

## 🚨 Önemli Notlar

### 1. Telegram ID Gönderme

Throttling sisteminin doğru çalışması için **mutlaka** `telegram_id` gönderin:

```typescript
// ✅ Doğru
{
  "telegram_id": 123456789,
  "action": "login"
}

// ❌ Yanlış (IP bazlı throttling kullanılır)
{
  "user_id": 123456789,
  "action": "login"
}
```

### 2. Header Alternatifi

Telegram ID'yi header olarak da gönderebilirsiniz:

```typescript
fetch('/api/endpoint', {
  headers: {
    'X-Telegram-ID': '123456789',
    'Content-Type': 'application/json',
  },
});
```

### 3. Debug Mode

Development ortamında throttling logları görüntülenir:

```bash
🔒 Throttling check - Telegram ID: 123456789, IP: 192.168.1.1, Limit: 1/2000ms
```

## 📈 Performance Optimizasyonu

### 1. Redis Konfigürasyonu

```typescript
// app.module.ts
storage: new ThrottlerStorageRedisService({
  host: 'localhost',
  port: 6379,
  // Redis connection pool ayarları
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
});
```

### 2. Throttling Seviyelerini Optimize Etme

- **Strict**: Ödeme, exchange, kritik işlemler
- **Default**: Login, register, genel API
- **Relaxed**: Profile, stats, okuma işlemleri

## 🔍 Monitoring ve Logging

### Redis Key Monitoring

```bash
# Redis'te throttling key'lerini görüntüle
redis-cli KEYS "*throttle*"

# Belirli bir kullanıcının durumunu kontrol et
redis-cli GET "throttle:telegram_123456789"
```

### Log Monitoring

```typescript
// Custom guard'da log ekleme
if (process.env.NODE_ENV === 'development') {
  console.log(`🔒 Throttling: ${identifier}, Hits: ${hits}, TTL: ${ttl}`);
}
```

Bu sistem sayesinde API'nizi DDoS saldırılarından koruyabilir ve kullanıcı deneyimini iyileştirebilirsiniz! 🚀
