import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type IUser } from "../../types";

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
    level: 0,
    profit_per_hour: 0,
    is_premium: false,
    auto_collector: false,
  },
  userCards: [],
  createdAt: "",
  updatedAt: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return action.payload;
    },
    loadingUser: (state, action: PayloadAction<UserState>) => {
      console.log("loadingUser action.payload: ", action.payload);
      console.log("loadingUser state before: ", state);
      return action.payload;
    },
    updateUserforUnlockCard: (
      state,
      action: PayloadAction<{ stones: number }>
    ) => {
      state.game_data.stones = action.payload.stones;
    },
    updateUserforCompleteTask: (
      state,
      action: PayloadAction<{ stones: number }>
    ) => {
      state.game_data.stones = action.payload.stones;
    },
  },
});

export const {
  setUser,
  loadingUser,
  updateUserforUnlockCard,
  updateUserforCompleteTask,
} = userSlice.actions;

export default userSlice.reducer;
