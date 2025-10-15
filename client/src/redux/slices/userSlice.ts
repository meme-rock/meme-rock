import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types";

type UserState = IUser & {
  // Real-time counter state (persists across page navigation)
  displayRocks: number;
  lastCounterUpdate: number;
};

const initialState: UserState = {
  __v: 0,
  _id: "",
  invited_by: null,
  invite_count: 0,
  telegram_data: {
    username: "",
    language_code: "",
    first_name: "",
    last_name: "",
    photo_url: "",
    is_telegram_premium: false,
    allows_write_to_pm: false,
  },
  game_data: {
    stones: 0,
    dust: 0,

    spent_dust: 0,
    spent_stone: 0,
    profit_per_hour: 0,
    is_premium: false,
    auto_collector: false,
    miner_data: {
      miner: "",
      last_mine: new Date(),
    },
    hilti_data: {
      hilti: "",
      last_claim: new Date(),
    },
    boosters: [],
  },
  airdrop_data: {
    rock_coins: 0,
    wallet_address: null,
  },
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
    updateUserStones: (state, action: PayloadAction<{ stones: number }>) => {
      state.game_data.stones = action.payload.stones;
    },
    updateUserforCompleteTask: (
      state,
      action: PayloadAction<{ stones: number }>
    ) => {
      state.game_data.stones = action.payload.stones;
    },
    updateUserBoosters: (state, action: PayloadAction<{ boosters: any[] }>) => {
      state.game_data.boosters = action.payload.boosters;
    },
    updateUserFromBoosterAction: (state, action: PayloadAction<IUser>) => {
      // Booster unlock/upgrade sonrası tüm user data'yı güncelle
      state.game_data.stones = action.payload.game_data.stones;
      state.game_data.dust = action.payload.game_data.dust;
      state.airdrop_data.rock_coins = action.payload.airdrop_data.rock_coins;
      state.game_data.spent_stone = action.payload.game_data.spent_stone;
      state.game_data.spent_dust = action.payload.game_data.spent_dust;
      state.game_data.profit_per_hour =
        action.payload.game_data.profit_per_hour;
      state.game_data.boosters = action.payload.game_data.boosters;
    },
    // Update display rocks (called every 5 seconds)
    updateDisplayRocks: (state, action: PayloadAction<number>) => {
      state.displayRocks = action.payload;
      state.lastCounterUpdate = Date.now();
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
} = userSlice.actions;

export default userSlice.reducer;
