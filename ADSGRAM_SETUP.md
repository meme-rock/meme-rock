# 📺 Adsgram Setup Guide

## 🔑 Block ID Format

Adsgram block ID must be in format: **`task-X`** where X is a decimal number.

### ✅ Valid Examples:

```
task-1234
task-5678
task-9999
task-123456
```

### ❌ Invalid Examples:

```
1234           (missing "task-" prefix)
block-1234     (wrong prefix)
TASK-1234      (uppercase not accepted)
task_1234      (underscore not accepted)
```

---

## 🚀 Step-by-Step Setup

### 1. Get Your Block ID

1. Go to [Adsgram Dashboard](https://adsgram.ai/dashboard)
2. Create a new block:
   - Click "Create Block" or "New Ad Block"
   - Choose your settings (ad format, rewards, etc.)
3. After creation, you'll see your Block ID
   - Format will be: `task-XXXX` (e.g., `task-1234`)
4. **Copy this Block ID** - you'll need it!

---

### 2. Configure Reward Callback URL

In Adsgram Dashboard:

1. Go to your Block settings
2. Find **"Reward Callback URL"** or **"Webhook URL"** field
3. Enter your webhook URL:

**Local Development:**

```
http://localhost:8080/user/ad-reward?userid=[userId]&token=meme_rock_ad_secret_2024
```

**Production:**

```
https://your-domain.com/user/ad-reward?userid=[userId]&token=meme_rock_ad_secret_2024
```

4. **Important:** Keep `[userId]` exactly as shown - Adsgram will replace it automatically
5. Save changes

---

### 3. Add Block ID to Frontend

Create or update `.env` file in `/client` directory:

```bash
# Adsgram Block ID (format: task-XXXX)
VITE_ADSGRAM_BLOCK_ID=task-1234

# Replace task-1234 with your actual Block ID from dashboard
```

**Example:**

```bash
VITE_ADSGRAM_BLOCK_ID=task-5678
VITE_API_URL=http://localhost:3000
```

---

### 4. Add Webhook Token to Backend

Create or update `.env` file in `/server` directory:

```bash
# Ad Provider Webhook Security Token
AD_WEBHOOK_TOKEN=meme_rock_ad_secret_2024

# MongoDB & Server
MONGODB_URI=mongodb://localhost:27017/meme-rock
PORT=8080
```

---

## 🧪 Testing

### 1. Test Block ID in Frontend

Check browser console after app loads:

```javascript
// Should log your block ID
console.log(import.meta.env.VITE_ADSGRAM_BLOCK_ID);
// Expected: "task-1234"
```

### 2. Test Ad Display

1. Open your app
2. Go to Dust page
3. Click "Watch Ad" button
4. Ad should appear from Adsgram

### 3. Test Webhook

Simulate Adsgram calling your webhook:

```bash
# Replace YOUR_TELEGRAM_ID with actual Telegram user ID
curl "http://localhost:8080/user/ad-reward?userid=YOUR_TELEGRAM_ID&token=meme_rock_ad_secret_2024"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Reward processed successfully"
}
```

---

## 🔍 Troubleshooting

### Block ID Issues

**Problem:** "Block ID format is invalid"

- ✅ Check format is exactly `task-XXXX` (lowercase)
- ✅ No spaces before or after
- ✅ Only decimal numbers after dash

**Problem:** "Block not found"

- ✅ Verify Block ID exists in Adsgram dashboard
- ✅ Check if block is active/published
- ✅ Ensure you copied the correct ID

### Webhook Issues

**Problem:** "Webhook not being called"

- ✅ Verify URL in Adsgram dashboard is correct
- ✅ Check if server is running on port 8080
- ✅ For local testing, use ngrok to expose localhost
- ✅ Check Adsgram dashboard logs for webhook status

**Problem:** "Invalid token error"

- ✅ Token in webhook URL must match backend .env
- ✅ No spaces in token
- ✅ Check case sensitivity

**Problem:** "User not found"

- ✅ User must have logged into app at least once
- ✅ Check MongoDB for user with that Telegram ID
- ✅ Verify user ID format is correct (numbers only)

---

## 📱 Complete Example

### Frontend .env:

```bash
VITE_ADSGRAM_BLOCK_ID=task-1234
VITE_API_URL=http://localhost:8080
```

### Backend .env:

```bash
AD_WEBHOOK_TOKEN=meme_rock_ad_secret_2024
MONGODB_URI=mongodb://localhost:27017/meme-rock
PORT=8080
```

### Adsgram Dashboard Settings:

```
Block ID: task-1234
Reward Callback URL: http://localhost:8080/user/ad-reward?userid=[userId]&token=meme_rock_ad_secret_2024
```

---

## 🎯 Verification Checklist

Before going live:

- [ ] Block ID is in correct format (`task-XXXX`)
- [ ] Block ID added to frontend `.env`
- [ ] Webhook token added to backend `.env`
- [ ] Webhook URL configured in Adsgram dashboard
- [ ] Webhook URL includes `[userId]` placeholder
- [ ] Webhook URL includes correct token
- [ ] Test ad displays in app
- [ ] Test webhook with cURL
- [ ] Check backend logs for successful reward
- [ ] Verify dust increases in app after ad

---

## 📞 Support

If you encounter issues:

1. Check Adsgram Dashboard logs
2. Check backend console logs
3. Check browser console logs
4. Review `AD_WEBHOOK_SETUP.md` for detailed webhook info
5. Contact Adsgram support: support@adsgram.ai

---

## 🔗 Useful Resources

- Adsgram Dashboard: https://adsgram.ai/dashboard
- Adsgram Documentation: https://adsgram.ai/docs
- Adsgram Support: support@adsgram.ai
