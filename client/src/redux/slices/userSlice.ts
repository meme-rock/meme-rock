import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types";
import { EHiltiLevel, EMinerLevel } from "../../types/enums";

type UserState = IUser & {
  // Real-time counter state (persists across page navigation)
  displayRocks: number;
  lastCounterUpdate: number;
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
    ads_watched: 0,
    ads_watched_today: 0,
    last_ad_watched: new Date(),
  },
  miner_data: {
    miner: {
      _id: EMinerLevel.LEVEL_1,
      profit_per_hour: 0,
      spent_stones_to_upgrade: 0,
    },
    last_mine: new Date(),
  },
  hilti_data: {
    hilti: {
      _id: EHiltiLevel.LEVEL_1,
      profit_per_hour: 0,
    },
  },
  boosters: [],
  achievements: [],
  is_premium: false,
  invited_by: null,
  invite_count: 0,
  created_at: "",
  last_online: "",
  createdAt: "",
  updatedAt: "",

  displayRocks: 0,
  lastCounterUpdate: Date.now(),
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    loadingUser: (state, action: PayloadAction<IUser>) => {
      console.log("loadingUser action.payload: ", action.payload);
      console.log("loadingUser state before: ", state);

      // Initialize displayRocks from backend data
      const newState = {
        ...action.payload,
        displayRocks: action.payload.airdrop_data.rock_coins,
        lastCounterUpdate: Date.now(),
      };
      return newState;
    },
    updateUserStones: (
      state,
      action: PayloadAction<{ stones: number; last_mine?: string }>
    ) => {
      state.balance_data.stone = action.payload.stones;
      // Update last_mine if provided (from mining reward)
      if (action.payload.last_mine) {
        state.miner_data.last_mine = new Date(action.payload.last_mine);
      }
    },
    updateUserforCompleteTask: (
      state,
      action: PayloadAction<{ stones: number }>
    ) => {
      state.balance_data.stone = action.payload.stones;
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
  },
});

export const {
  setUser,
  loadingUser,
  updateUserStones,
  updateUserforCompleteTask,
  updateUserBoosters,
  updateUserFromBoosterAction,
  updateDisplayRocks,
  updateUserDust,
  updateUserOnStoneToDustExchange,
  updateUserOnDustToStoneExchange,
  updateUserAchievements,
} = userSlice.actions;

export default userSlice.reducer;
