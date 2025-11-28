export enum ETaskType {
  COMMON = 'COMMON',
  DAILY = 'DAILY',
  REUSABLE = 'REUSABLE',
  PARTNER = 'PARTNER',
}

export enum ETaskAPIType {
  NONE = 'NONE',
  TELEGRAM_API = 'TELEGRAM_API',
  X_API = 'X_API',
}

export enum ETaskIcon {
  TELEGRAM = 'TELEGRAM',
  X = 'X',
  YOUTUBE = 'YOUTUBE',
  DISCORD = 'DISCORD',
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
}

export enum EUserTaskStatus {
  PENDING = 'PENDING', // Henüz başlanmadı
  VERIFYING = 'VERIFYING', // Süre işliyor (Fake Mod) veya API kontrolü bekleniyor
  READY_TO_CLAIM = 'READY', // Süre doldu veya API onayladı, claim butonu aktif
  CLAIMED = 'CLAIMED', // Ödül alındı
}

export enum EDailyTaskMatch {
  JOIN_TG_CHANNEL_ROCK = 'join_tg_channel_rock',
  JOIN_TG_CHANNEL_DD = 'join_tg_channel_dd',
  ADS_WATCHED = 'ads_watched',
}
