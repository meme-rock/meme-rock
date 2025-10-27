// src/config.ts (VEYA İLGİLİ SABİT DOSYANIZ)

// Tip tanımını oluşturuyoruz (Kullanılan objenin yapısı)
export type StarMarketItem = {
  stars_price: number;
  stone_amount: number;
  stone_bonus: number;
  total_stones: number;
};

export type TonMarketItem = {
  ton_price: number;
  stone_amount: number;
  stone_bonus: number;
  total_stones: number;
};

export type DailyRewardItem = {
  day: number;
  reward: number;
  dust_price: number;
};

/**
 * Yıldız paketleri verisi.
 * JSON formatına tamamen uyumludur ve kolayca okunabilir.
 */
/**
 * Telegram Stars ile Stone Satış Paketleri
 * Stars Fiyatı = Stone Miktarı (1 Stars = 1 Stone Fiyat Birimi)
 */
export const STONE_MARKET_STAR: StarMarketItem[] = [
  {
    stars_price: 1, // 100
    stone_amount: 100,
    stone_bonus: 0,
    total_stones: 100,
  },
  {
    stars_price: 2, // 500
    stone_amount: 500,
    stone_bonus: 25, // 500 * 0.05
    total_stones: 525,
  },
  {
    stars_price: 1000,
    stone_amount: 1000,
    stone_bonus: 100, // 1000 * 0.10
    total_stones: 1100,
  },
  {
    stars_price: 2500,
    stone_amount: 2500,
    stone_bonus: 375, // 2500 * 0.15
    total_stones: 2875,
  },
  {
    stars_price: 5000,
    stone_amount: 5000,
    stone_bonus: 1000, // 5000 * 0.20
    total_stones: 6000,
  },
];

export const STONE_MARKET_TON: TonMarketItem[] = [
  {
    ton_price: 1.0, // 1 TON
    stone_amount: 150, // Yaklaşık $2.00 USD karşılığı (Bonussuz)
    stone_bonus: 30, // Sadece %20 TON bonusu
    total_stones: 180,
  },
  {
    ton_price: 5.0, // 5 TON
    stone_amount: 750,
    stone_bonus: 190, // %5 toplu (38) + %20 TON (150)
    total_stones: 940,
  },
  {
    ton_price: 10.0, // 10 TON
    stone_amount: 1500,
    stone_bonus: 450, // %10 toplu (150) + %20 TON (300)
    total_stones: 1950,
  },
  {
    ton_price: 25.0, // 25 TON
    stone_amount: 3850,
    stone_bonus: 1350, // %15 toplu (578) + %20 TON (770)
    total_stones: 5200,
  },
  {
    ton_price: 50.0, // 50 TON (Yeni Paket)
    stone_amount: 7700,
    stone_bonus: 3100, // %20 toplu (1540) + %20 TON (1540)
    total_stones: 10800,
  },
  {
    ton_price: 100.0, // 100 TON (Yeni Paket)
    stone_amount: 15380,
    stone_bonus: 6200, // %20 toplu (3076) + %20 TON (3076)
    total_stones: 21600,
  },
];

export const DAILY_REWARD: DailyRewardItem[] = [
  {
    day: 1,
    reward: 5,
    dust_price: 50,
  },
  {
    day: 2,
    reward: 10,
    dust_price: 55,
  },
  {
    day: 3,
    reward: 15,
    dust_price: 60,
  },
  {
    day: 4,
    reward: 20,
    dust_price: 65,
  },
  {
    day: 5,
    reward: 25,
    dust_price: 70,
  },
  {
    day: 6,
    reward: 30,
    dust_price: 75,
  },
  {
    day: 7,
    reward: 35,
    dust_price: 80,
  },
  {
    day: 8,
    reward: 40,
    dust_price: 85,
  },
  {
    day: 9,
    reward: 45,
    dust_price: 90,
  },
  {
    day: 10,
    reward: 50,
    dust_price: 100,
  },
];

//! ACHIEVEMENTS
export type AchievementItem = {
  id: string;
  title: string;
  description: string;
  stone_reward: number;
  achievement_type: 'invite' | 'ad';
};

const INVITE_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'Invite-1',
    title: 'First Friend',
    description: 'Invite your first friend',
    stone_reward: 10,
    achievement_type: 'invite',
  },
  {
    id: 'Invite-2',
    title: 'Social Starter',
    description: 'Invite 2 friends',
    stone_reward: 20,
    achievement_type: 'invite',
  },
  {
    id: 'Invite-5',
    title: 'Social',
    description: 'Invite 5 friends',
    stone_reward: 50,
    achievement_type: 'invite',
  },
  {
    id: 'Invite-10',
    title: 'Network Builder',
    description: 'Invite 10 friends',
    stone_reward: 100,
    achievement_type: 'invite',
  },
  {
    id: 'Invite-25',
    title: 'Community Connector',
    description: 'Invite 25 friends',
    stone_reward: 250,
    achievement_type: 'invite',
  },
  {
    id: 'Invite-50',
    title: 'Community Leader',
    description: 'Invite 50 friends',
    stone_reward: 500,
    achievement_type: 'invite',
  },
  {
    id: 'Invite-100',
    title: 'Influencer',
    description: 'Invite 100 friends',
    stone_reward: 1000,
    achievement_type: 'invite',
  },
  {
    id: 'Invite-250',
    title: 'Superstar',
    description: 'Invite 250 friends',
    stone_reward: 2500,
    achievement_type: 'invite',
  },
  {
    id: 'Invite-500',
    title: 'Legend',
    description: 'Invite 500 friends',
    stone_reward: 5000,
    achievement_type: 'invite',
  },
  {
    id: 'Invite-1000',
    title: 'Mythic',
    description: 'Invite 1000 friends',
    stone_reward: 10000,
    achievement_type: 'invite',
  },
];

const AD_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'Ad-10',
    title: 'Viewer',
    description: 'Watch 10 ads',
    stone_reward: 5,
    achievement_type: 'ad',
  },
  {
    id: 'Ad-50',
    title: 'Explorer',
    description: 'Watch 100 ads',
    stone_reward: 10,
    achievement_type: 'ad',
  },
  {
    id: 'Ad-100',
    title: 'Supporter',
    description: 'Watch 100 ads',
    stone_reward: 20,
    achievement_type: 'ad',
  },
  {
    id: 'Ad-250',
    title: 'Ad Hunter',
    description: 'Watch 250 ads',
    stone_reward: 40,
    achievement_type: 'ad',
  },
  {
    id: 'Ad-500',
    title: 'Adventurer',
    description: 'Watch 500 ads',
    stone_reward: 80,
    achievement_type: 'ad',
  },
  {
    id: 'Ad-1000',
    title: 'Ad Hunter',
    description: 'Watch 2500 ads',
    stone_reward: 160,
    achievement_type: 'ad',
  },
  {
    id: 'Ad-2500',
    title: 'Ad Star',
    description: 'Watch 2500 ads',
    stone_reward: 350,
    achievement_type: 'ad',
  },
];

export const ACHIVEMENTS = {
  INVITE: INVITE_ACHIEVEMENTS,
  AD: AD_ACHIEVEMENTS,
};
