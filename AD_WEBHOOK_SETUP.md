# 📺 Ad Provider Webhook Setup

## 🔑 Adsgram Block ID Format

**Important:** Block ID must be in format `task-X` where X is a decimal number.

### Examples:

- ✅ `task-1234`
- ✅ `task-5678`
- ✅ `task-9999`
- ❌ `1234` (missing "task-" prefix)
- ❌ `block-1234` (wrong prefix)

### How to Get Your Block ID:

1. Go to Adsgram Dashboard
2. Create a new block
3. Copy the block ID (will be in format `task-XXXX`)
4. Add to your `.env` file:
   ```bash
   VITE_ADSGRAM_BLOCK_ID=task-1234
   ```

---

## 🎯 Webhook URL Configuration

### Local Development:

```
http://localhost:8080/user/ad-reward?userid=[userId]&token=meme_rock_ad_secret_2024
```

### Production:

```
https://your-domain.com/user/ad-reward?userid=[userId]&token=meme_rock_ad_secret_2024
```

---

## 🔐 Security Token

**Current Token:** `meme_rock_ad_secret_2024`

⚠️ **Important:** Change this token in production!

### How to Change Token:

1. **Backend (.env file):**

```bash
AD_WEBHOOK_TOKEN=your_super_secret_token_here
```

2. **Update Webhook URL:**

```
https://your-domain.com/user/ad-reward?userid=[userId]&token=your_super_secret_token_here
```

---

## 📱 Adsgram Configuration

### Dashboard Setup:

1. Go to Adsgram Dashboard
2. Create a new block (or select existing one)
   - Block ID will be in format: `task-1234`
3. Navigate to your Block settings
4. Find "Reward Callback URL" field
5. Enter: `http://localhost:8080/user/ad-reward?userid=[userId]&token=meme_rock_ad_secret_2024`
6. Copy your Block ID (format: `task-XXXX`)
7. Add to frontend `.env` file:
   ```bash
   VITE_ADSGRAM_BLOCK_ID=task-1234
   ```
8. Save configuration

### URL Placeholder:

- `[userId]` will be automatically replaced by Adsgram with actual Telegram user ID
- Example: If user's Telegram ID is `123456789`, Adsgram will call:
  ```
  http://localhost:8080/user/ad-reward?userid=123456789&token=meme_rock_ad_secret_2024
  ```

---

## 🌐 AdExtra Configuration

### Dashboard Setup:

1. Go to AdExtra Dashboard
2. Find "Postback URL" or "Callback URL" setting
3. Enter the same URL format
4. Check their documentation for user ID placeholder syntax
   (might be `{user_id}` or `[user_id]` instead of `[userId]`)

---

## 🧪 Testing Webhook

### Manual Test with cURL:

```bash
curl "http://localhost:8080/user/ad-reward?userid=YOUR_TELEGRAM_ID&token=meme_rock_ad_secret_2024"
```

### Expected Response:

```json
{
  "success": true,
  "message": "Reward processed successfully"
}
```

### Test with Wrong Token:

```bash
curl "http://localhost:8080/user/ad-reward?userid=123456789&token=wrong_token"
```

### Expected Response:

```json
{
  "statusCode": 500,
  "message": "Invalid token"
}
```

---

## 📊 Webhook Flow

```
User watches ad in app
        ↓
Ad provider (Adsgram/AdExtra) server detects completion
        ↓
Ad provider calls webhook:
GET http://localhost:8080/user/ad-reward?userid=123456789&token=meme_rock_ad_secret_2024
        ↓
Backend verifies token
        ↓
Backend adds 10 dust to user
        ↓
Backend returns success
        ↓
User sees updated dust on next app refresh
```

---

## 🔍 Monitoring & Logs

### Backend logs will show:

```
✅ Ad reward webhook: User 123456789 received 10 dust (new balance: 110)
```

### Error logs:

```
❌ Invalid token attempt for user 123456789
❌ User not found: 123456789
```

---

## ⚙️ Environment Variables

### Required in `.env`:

```bash
PORT=8080
AD_WEBHOOK_TOKEN=meme_rock_ad_secret_2024
```

### Optional (for production):

```bash
# Enable CORS for ad provider domains
CORS_ORIGIN=https://adsgram.ai,https://adextra.io

# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

---

## 🚀 Production Deployment

### 1. Update Token:

Generate a strong random token:

```bash
openssl rand -hex 32
```

### 2. Update .env:

```bash
AD_WEBHOOK_TOKEN=your_generated_token_here
```

### 3. Update Ad Provider Dashboard:

```
https://your-production-domain.com/user/ad-reward?userid=[userId]&token=your_generated_token_here
```

### 4. Test Production Webhook:

```bash
curl "https://your-production-domain.com/user/ad-reward?userid=test_user&token=your_generated_token_here"
```

---

## ❗ Troubleshooting

### Webhook not being called:

- ✅ Check if URL is correctly configured in ad provider dashboard
- ✅ Verify server is accessible from internet (use ngrok for local testing)
- ✅ Check firewall settings

### "Invalid token" error:

- ✅ Verify token in .env matches token in webhook URL
- ✅ No extra spaces in token
- ✅ Token is URL-encoded if contains special characters

### "User not found" error:

- ✅ Verify user ID is correct Telegram ID
- ✅ User must have logged in at least once
- ✅ Check MongoDB for user existence

---

## 🔗 Useful Links

- Adsgram Docs: https://adsgram.ai/docs
- AdExtra Docs: https://adextra.io/docs
- Testing with ngrok: https://ngrok.com

---

## 📝 Notes

- Webhook is GET request (not POST)
- Response must be fast (< 5 seconds)
- Idempotent: Multiple calls with same user should be safe
- Atomic operation prevents duplicate rewards
