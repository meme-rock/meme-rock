export enum ETaskType {
  COMMON = "COMMON",
  DAILY = "DAILY",
  PARTNER = "PARTNER",
  REUSABLE = "REUSABLE",
}

export enum ETaskAPIType {
  NONE = "NONE",
  TELEGRAM_API = "TELEGRAM_API",
  X_API = "X_API",
}

export enum ETaskIcon {
  TELEGRAM = "TELEGRAM",
  X = "X",
  YOUTUBE = "YOUTUBE",
  DISCORD = "DISCORD",
  TIKTOK = "TIKTOK",
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
}

export enum ETaskDailyMatch {
  JOIN_TG_CHANNEL_ROCK = "join_tg_channel_rock",
  JOIN_TG_CHANNEL_DD = "join_tg_channel_dd",
  ADS_WATCHED = "ads_watched",
}

export enum EUserTaskStatus {
  PENDING = "PENDING", // Henüz başlanmadı
  VERIFYING = "VERIFYING", // Süre işliyor (Fake Mod) veya API kontrolü bekleniyor
  READY_TO_CLAIM = "READY", // Süre doldu veya API onayladı, claim butonu aktif
  CLAIMED = "CLAIMED", // Ödül alındı
}

export enum EMinerLevel {
  LEVEL_1 = "LEVEL_1",
  LEVEL_2 = "LEVEL_2",
  LEVEL_3 = "LEVEL_3",
  LEVEL_4 = "LEVEL_4",
  LEVEL_5 = "LEVEL_5",
}

export enum EMinerRewardType {
  STONE = "STONE",
  DUST = "DUST",
}

export enum EHiltiLevel {
  LEVEL_1 = "LEVEL_1",
  LEVEL_2 = "LEVEL_2",
  LEVEL_3 = "LEVEL_3",
  LEVEL_4 = "LEVEL_4",
  LEVEL_5 = "LEVEL_5",
}

export enum EBoosterUnlockCurrencyType {
  STONE = "STONE",
  DUST = "DUST",
  INVITE = "INVITE",
  TON = "TON",
  STAR = "STAR",
}
