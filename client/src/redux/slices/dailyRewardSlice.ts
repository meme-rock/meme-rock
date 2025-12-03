import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface DailyReward {
  day: number;
  reward: number;
  dust_price: number;
}

interface DailyRewardState {
  dailyReward: DailyReward[];
}

const initialState: DailyRewardState = {
  dailyReward: [],
};

export const dailyRewardSlice = createSlice({
  name: "dailyReward",
  initialState,
  reducers: {
    setDailyRewards: (state, action: PayloadAction<DailyReward[]>) => {
      state.dailyReward = action.payload;
    },
  },
});

export const { setDailyRewards } = dailyRewardSlice.actions;

export default dailyRewardSlice.reducer;
