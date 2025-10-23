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
