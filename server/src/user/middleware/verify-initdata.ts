import crypto from 'crypto';

export interface TelegramInitDataUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface VerifiedInitData {
  user: TelegramInitDataUser;
  telegram_id: string;
  start_param: string | null;
  auth_date: number;
}

/**
 * initData'nın kaç saniye sonra geçersiz sayılacağı.
 * Tazelik kontrolü olmadan, bir kez ele geçirilen initData sonsuza kadar
 * kullanılabilir (replay). Telegram istemcisi initData'yı düzenli tazeler.
 */
const DEFAULT_MAX_AGE_SECONDS = 24 * 60 * 60;

const timingSafeEqualHex = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
};

/**
 * Telegram Web App initData'sını bot token ile doğrular.
 * Doğrulanmış veriyi döndürür, geçersizse null.
 *
 * Doğrulama: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export const parseAndVerifyInitData = (
  init_data: string,
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS,
): VerifiedInitData | null => {
  if (!init_data) return null;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is not defined');
  }

  const urlParams = new URLSearchParams(init_data);

  const hash = urlParams.get('hash');
  if (!hash) return null;

  urlParams.delete('hash');
  // 'signature' üçüncü taraf doğrulaması içindir, data_check_string'e girmez
  urlParams.delete('signature');
  urlParams.sort();

  const dataCheckString = [...urlParams.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  if (!timingSafeEqualHex(calculatedHash, hash)) return null;

  // Tazelik kontrolü — replay saldırısına karşı
  const authDateRaw = urlParams.get('auth_date');
  const authDate = authDateRaw ? parseInt(authDateRaw, 10) : NaN;
  if (!Number.isFinite(authDate)) return null;

  if (maxAgeSeconds > 0) {
    const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
    if (ageSeconds > maxAgeSeconds) return null;
    // Saati ileri alınmış istemcilere karşı küçük bir tolerans
    if (ageSeconds < -300) return null;
  }

  const userJson = urlParams.get('user');
  if (!userJson) return null;

  let user: TelegramInitDataUser;
  try {
    user = JSON.parse(userJson);
  } catch {
    return null;
  }

  if (user?.id === undefined || user?.id === null) return null;

  return {
    user,
    telegram_id: String(user.id),
    start_param: urlParams.get('start_param'),
    auth_date: authDate,
  };
};

/**
 * Geriye dönük uyumluluk: initData geçerli mi ve içindeki kullanıcı
 * beklenen telegram_id ile aynı mı?
 */
export const verifyInitData = (_id: string, init_data: string): boolean => {
  const verified = parseAndVerifyInitData(init_data);
  return !!verified && verified.telegram_id === String(_id);
};
