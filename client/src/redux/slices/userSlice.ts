import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { IAdData, IUser } from "../../types";
import {
  EHiltiLevel,
  EMinerLevel,
  EMinerRewardType,
  EUserTaskStatus,
} from "../../types/enums";
import { DailyRewardData } from "../services/daily-reward/responses";

type UserState = IUser & {
  // Real-time counter state (persists across page navigation)
  displayRocks: number;
  lastCounterUpdate: number;
  // Premium market item pricing
  premium_market_item?: {
    ton_price: number;
    stars_price: number;
  };
};

const initialState: UserState = {
  __v: 0,
  _id: "",
  telegram_data: {
    username: "",
    language_code: "",
    first_name: "",
    last_name: "",
    photo_url: "",
    is_telegram_premium: false,
    allows_write_to_pm: false,
  },
  balance_data: {
    stone: 0,
    dust: 0,
  },
  payment_data: {
    total_star_payment: 0,
    total_ton_payment: 0,
    last_payment_date: new Date(),
  },
  airdrop_data: {
    rock_coins: 0,
    wallet_address: null,
    profit_per_hour: 0,
  },
  ad_data: {
    ads_watched_total: 0,
    ads_watched_daily: 0,
  },
  miner_data: {
    miner: {
      _id: EMinerLevel.LEVEL_1,
      profit_per_hour: 0,
      stone_price_to_upgrade: 0,
      reward_type: EMinerRewardType.STONE,
    },
    max_periods: 2,
    claimable_periods: 0,
    last_mine: "",
    next_mine: "",
  },
  hilti_data: {
    hilti: {
      _id: EHiltiLevel.LEVEL_1,
      profit_per_hour: 0,
    },
  },
  boosters: [],
  achievements: [],
  tasks: [],
  is_premium: false,
  is_auto_mining: false,
  invited_by: null,
  invite_count: 0,
  daily_reward_data: {
    day: 1,
    last_claim_date: "",
  },
  last_online: "",
  createdAt: "",
  updatedAt: "",

  displayRocks: 0,
  lastCounterUpdate: Date.now(),
};
// İki objeyi güvenli bir şekilde birleştirir (Deep Merge)
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target }; // Hedefin kopyasını al

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    // Eğer gelen değer bir obje ise (ve null/array değilse), içini de birleştir
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      // @ts-ignore: TypeScript bazen jenerik tiplerde deep merge'e kızabilir, güvenle yoksayabilirsin
      result[key] = deepMerge(targetValue, sourceValue);
    }
    // Değer undefined değilse güncelle (null gelebilir, null geçerli bir değerdir ama undefined değildir)
    else if (sourceValue !== undefined) {
      // @ts-ignore
      result[key] = sourceValue;
    }
  }
  return result;
}
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    loadingUser: (state, action: PayloadAction<IUser>) => {
      console.log("loadingUser action.payload: ", action.payload);

      // Deep merge ile güvenli birleştirme yapıyoruz
      const mergedState = deepMerge(state, action.payload);

      // Sadece özel hesaplamaları sona ekle
      return {
        ...mergedState,
        displayRocks:
          action.payload.airdrop_data?.rock_coins ??
          state.airdrop_data.rock_coins ??
          0,
        lastCounterUpdate: Date.now(),
      };
    },
    updateUserStones: (
      state,
      action: PayloadAction<{ stones: number; last_mine?: string }>
    ) => {
      state.balance_data.stone = action.payload.stones;
      // Update last_mine if provided (from mining reward)
      if (action.payload.last_mine) {
        state.miner_data.last_mine = action.payload.last_mine;
      }
    },
    updateUserFromMine: (
      state,
      action: PayloadAction<{
        stone: number;
        dust: number;
        last_mine: string;
        next_mine: string;
        claimable_periods: number;
      }>
    ) => {
      state.balance_data.stone = action.payload.stone;
      state.balance_data.dust = action.payload.dust;
      state.miner_data.last_mine = action.payload.last_mine;
      state.miner_data.next_mine = action.payload.next_mine;
      state.miner_data.claimable_periods = action.payload.claimable_periods;
    },
    updateUserforCompleteTask: (
      state,
      action: PayloadAction<{ stones: number; task_id: string }>
    ) => {
      state.balance_data.stone = action.payload.stones;
      if (state.tasks) {
        const taskIndex = state.tasks.findIndex(
          (t) => t._id === action.payload.task_id
        );
        if (taskIndex !== -1) {
          state.tasks[taskIndex].status = EUserTaskStatus.CLAIMED;
        }
      }
    },
    updateUserDailyRewardData: (
      state,
      action: PayloadAction<DailyRewardData>
    ) => {
      state.daily_reward_data = action.payload;
    },
    updateUserBoosters: (state, action: PayloadAction<{ boosters: any[] }>) => {
      state.boosters = action.payload.boosters;
    },
    updateUserFromBoosterAction: (state, action: PayloadAction<IUser>) => {
      // Booster unlock/upgrade sonrası tüm user data'yı güncelle
      state.balance_data.stone = action.payload.balance_data.stone;
      state.balance_data.dust = action.payload.balance_data.dust;
      state.airdrop_data.rock_coins = action.payload.airdrop_data.rock_coins;
      state.airdrop_data.profit_per_hour =
        action.payload.airdrop_data.profit_per_hour;
      state.boosters = action.payload.boosters;
    },
    // Update display rocks (called every 2 seconds)
    updateDisplayRocks: (state, action: PayloadAction<number>) => {
      state.displayRocks = action.payload;
      state.lastCounterUpdate = Date.now();
    },
    // Update dust balance (set from backend after ad reward)
    updateUserDust: (state, action: PayloadAction<number>) => {
      state.balance_data.dust = action.payload;
      console.log(`💰 Dust balance updated: ${action.payload}`);
    },
    updateUserBalance: (
      state,
      action: PayloadAction<{ stone: number; dust: number }>
    ) => {
      state.balance_data.stone = action.payload.stone;
      state.balance_data.dust = action.payload.dust;
    },
    updateUserOnStoneToDustExchange: (
      state,
      action: PayloadAction<{ dust: number; stones: number }>
    ) => {
      state.balance_data.dust = action.payload.dust;
      state.balance_data.stone = action.payload.stones;
    },
    updateUserOnDustToStoneExchange: (
      state,
      action: PayloadAction<{ dust: number; stones: number }>
    ) => {
      state.balance_data.dust = action.payload.dust;
      state.balance_data.stone = action.payload.stones;
    },
    updateUserAdData: (state, action: PayloadAction<IAdData>) => {
      state.ad_data = action.payload;
    },
    updateUserAchievements: (
      state,
      action: PayloadAction<
        Array<{
          id: string;
          claimed_at?: string;
        }>
      >
    ) => {
      state.achievements = action.payload.map((achievement) => ({
        ...achievement,
        achievement_id: achievement.id,
      }));
    },
    setPremiumMarketItem: (
      state,
      action: PayloadAction<{
        ton_price: number;
        stars_price: number;
      }>
    ) => {
      state.premium_market_item = action.payload;
    },
    setIsPremium: (state, action: PayloadAction<boolean>) => {
      state.is_premium = action.payload;
    },
  },
});

export const {
  setUser,
  loadingUser,
  updateUserStones,
  updateUserFromMine,
  updateUserforCompleteTask,
  updateUserBoosters,
  updateUserFromBoosterAction,
  updateDisplayRocks,
  updateUserDust,
  updateUserBalance,
  updateUserAdData,
  updateUserOnStoneToDustExchange,
  updateUserOnDustToStoneExchange,
  updateUserAchievements,
  setPremiumMarketItem,
  setIsPremium,
  updateUserDailyRewardData,
} = userSlice.actions;

export default userSlice.reducer;
