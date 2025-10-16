# 📨 Kullanıcı Bildirim Sistemi - Kullanım Kılavuzu

## 🎯 Genel Bakış

`BotService.sendNotificationToUser()` metodu, belirli bir kullanıcıya özel mesaj göndermek için tasarlanmıştır. Bu sistem, broadcast'ten farklı olarak tek kullanıcıya odaklanır.

## 🚀 Özellikler

- ✅ **Tek kullanıcıya mesaj** gönderimi
- ✅ **MarkdownV2** format desteği
- ✅ **Hata yönetimi** (Blocked users, chat not found, vs.)
- ✅ **Detaylı logging** (Başarı/başarısızlık logları)
- ✅ **Promise-based** response

## 📝 Kullanım

### Temel Kullanım

```typescript
import { BotService } from './bot/bot.service';

// Service'i inject et
constructor(private readonly botService: BotService) {}

// Kullanıcıya mesaj gönder
async sendWelcomeMessage(userId: number) {
  const message = `
🎉 *Hoş Geldin!*

Oyunumuza katıldığın için teşekkürler!
Şimdi kazanmaya başlayabilirsin 🚀

\\[Oyunu Başlat\\]\\(https://t\\.me/your\\_bot/app\\)
  `;

  const result = await this.botService.sendNotificationToUser(userId, message);

  if (result.success) {
    console.log('✅ Mesaj gönderildi');
  } else {
    console.log('❌ Mesaj gönderilemedi:', result.message);
  }
}
```

### Response Format

```typescript
// Başarılı durumda:
{
  success: true,
  message: "Notification sent successfully"
}

// Başarısız durumda:
{
  success: false,
  message: "User blocked bot or chat not found",
  error: "Forbidden: bot was blocked by the user"
}
```

## 🔧 Kullanım Senaryoları

### 1. Yeni Kullanıcı Hoş Geldin Mesajı

```typescript
async onNewUser(userId: number) {
  const welcomeMessage = `
🎮 *Meme\\-Rock'a Hoş Geldin!*

💰 Günlük ödüllerini al
⛏️ Madencilik yap
💎 Kıymetli kaynakları topla
🎯 Görevleri tamamla

\\[Oyunu Başlat\\]\\(https://t\\.me/your\\_bot/app\\)
  `;

  return this.botService.sendNotificationToUser(userId, welcomeMessage);
}
```

### 2. Ödül Bildirimi

```typescript
async notifyRewardClaimed(userId: number, rewardAmount: number) {
  const message = `
🎉 *Ödül Alındı!*

💰 \\+${rewardAmount} Rock kazandın!
📊 Günlük ödülünü başarıyla aldın

Devam etmek için oyunu aç:
\\[Oyunu Aç\\]\\(https://t\\.me/your\\_bot/app\\)
  `;

  return this.botService.sendNotificationToUser(userId, message);
}
```

### 3. Hata Bildirimi

```typescript
async notifyError(userId: number, errorType: string) {
  const message = `
⚠️ *Bir Sorun Oluştu*

❌ ${errorType}
🔧 Teknik ekibimiz sorunu çözüyor

Sorun devam ederse desteğe ulaş:
\\[Destek\\]\\(https://t\\.me/your\\_support\\)
  `;

  return this.botService.sendNotificationToUser(userId, message);
}
```

### 4. Özel Etkinlik Bildirimi

```typescript
async notifySpecialEvent(userId: number, eventName: string) {
  const message = `
🎊 *Özel Etkinlik!*

${eventName} başladı!
🎁 Sınırlı süreli ödüller
⚡ 2x kazanç bonusu

Kaçırma:
\\[Etkinliğe Katıl\\]\\(https://t\\.me/your\\_bot/app\\)
  `;

  return this.botService.sendNotificationToUser(userId, message);
}
```

## 📊 Hata Yönetimi

### Yaygın Hata Durumları

1. **Bot Blocked**: Kullanıcı botu engellemiş
2. **Chat Not Found**: Kullanıcı botla hiç konuşmamış
3. **User Deactivated**: Kullanıcı hesabı deaktif
4. **Network Error**: Ağ bağlantı sorunu

### Hata Handling Örneği

```typescript
async sendWithRetry(userId: number, message: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await this.botService.sendNotificationToUser(userId, message);

    if (result.success) {
      return result;
    }

    // Bot blocked gibi durumlar için retry yapma
    if (result.message.includes('blocked') ||
        result.message.includes('not found')) {
      return result; // Direkt döndür, retry yapma
    }

    // Diğer hatalar için retry
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return { success: false, message: 'Max retries exceeded' };
}
```

## ⚠️ Önemli Notlar

### MarkdownV2 Kaçış Karakterleri

Telegram'ın MarkdownV2 formatında özel karakterleri kaçırmanız gerekir:

```typescript
// Yanlış
const message = 'Merhaba! Bu bir test mesajıdır. (Önemli)';

// Doğru
const message = 'Merhaba\\! Bu bir test mesajıdır\\. \\(Önemli\\)';
```

**Kaçırılması gereken karakterler:**

- `_` → `\_`
- `*` → `\*`
- `[` → `\[`
- `]` → `\]`
- `(` → `\(`
- `)` → `\)`
- `~` → `\~`
- `` ` `` → `` \` ``
- `>` → `\>`
- `#` → `\#`
- `+` → `\+`
- `-` → `\-`
- `=` → `\=`
- `|` → `\|`
- `{` → `\{`
- `}` → `\}`
- `.` → `\.`
- `!` → `\!`

### Performance İpuçları

1. **Rate Limiting**: Çok fazla mesaj göndermeyin
2. **Batching**: Toplu işlemler için broadcast kullanın
3. **Error Handling**: Her zaman hata durumlarını handle edin

## 🎯 Broadcast vs Notification

| Özellik            | Broadcast        | Notification     |
| ------------------ | ---------------- | ---------------- |
| **Hedef**          | Tüm kullanıcılar | Tek kullanıcı    |
| **Kullanım**       | Duyuru, etkinlik | Kişisel bildirim |
| **Performance**    | Rate limited     | Hızlı            |
| **Error Handling** | Toplu            | Bireysel         |

## 📞 Örnek Entegrasyon

```typescript
// user.service.ts içinde
import { BotService } from '../bot/bot.service';

@Injectable()
export class UserService {
  constructor(private readonly botService: BotService) {}

  async createUser(userData: any) {
    // Kullanıcıyı oluştur
    const user = await this.userModel.create(userData);

    // Hoş geldin mesajı gönder
    try {
      await this.botService.sendNotificationToUser(
        user.telegramId,
        '🎉 Hoş geldin! Oyunu başlat: [Oyunu Aç](https://t.me/your_bot/app)',
      );
    } catch (error) {
      console.log('Hoş geldin mesajı gönderilemedi:', error);
    }

    return user;
  }
}
```

Bu sistem sayesinde kullanıcılarınıza kişiselleştirilmiş bildirimler gönderebilirsiniz! 🚀
