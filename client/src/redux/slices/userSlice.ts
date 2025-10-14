import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types";

type UserState = IUser;

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
    rocks: 0,
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
      current_energy: 0,
      last_energy_refill: new Date(),
    },
    boosters: [],
  },
  createdAt: "",
  updatedAt: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    loadingUser: (state, action: PayloadAction<UserState>) => {
      console.log("loadingUser action.payload: ", action.payload);
      console.log("loadingUser state before: ", state);
      return action.payload;
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
  },
});

export const {
  setUser,
  loadingUser,
  updateUserStones,
  updateUserforCompleteTask,
  updateUserBoosters,
} = userSlice.actions;

export default userSlice.reducer;
