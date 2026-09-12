const crypto = require('crypto');
const botToken = process.env.TELEGRAM_BOT_TOKEN;

const user = {
  id: 999000111,
  first_name: "Bilal",
  last_name: "Bindal",
  username: "memerock_demo",
  language_code: "en",
  is_premium: true,
  allows_write_to_pm: true,
};

const params = {
  query_id: "AAH" + crypto.randomBytes(8).toString("hex"),
  user: JSON.stringify(user),
  auth_date: String(Math.floor(Date.now() / 1000)),
  chat_type: "private",
  chat_instance: "-1234567890123456789",
};

// data_check_string: sorted keys, excluding hash
const dataCheckString = Object.keys(params).sort()
  .map(k => `${k}=${params[k]}`).join("\n");

const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
const hash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

const initData = new URLSearchParams({ ...params, hash }).toString();

const fs=require("fs");
const SP = __dirname;
fs.writeFileSync(SP+"/initdata.txt", initData);
console.log("USER_ID=" + user.id);
console.log("\n=== initData (raw) ===\n" + initData);
console.log("\n=== OPEN THIS URL IN BROWSER ===\n");
const themeParams = encodeURIComponent(JSON.stringify({
  bg_color: "#000000", text_color: "#ffffff", hint_color: "#708499",
  link_color: "#6ab3f3", button_color: "#5288c1", button_text_color: "#ffffff",
  secondary_bg_color: "#131415", header_bg_color: "#17212b",
  accent_text_color: "#6ab2f2", section_bg_color: "#17212b",
  section_header_text_color: "#6ab3f3", subtitle_text_color: "#708499",
  destructive_text_color: "#ec3942"
}));
const url=`http://localhost:5173/#tgWebAppData=${encodeURIComponent(initData)}&tgWebAppVersion=8.0&tgWebAppPlatform=tdesktop&tgWebAppThemeParams=${themeParams}`;
fs.writeFileSync(SP+"/url.txt", url);
console.log(url);
