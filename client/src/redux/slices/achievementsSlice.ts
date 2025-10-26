import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  stone_reward?: number;
  is_claimed: boolean;
  claimed_at?: string;
}

interface AchievementsState {
  allAchievements: Achievement[];
}

const initialState: AchievementsState = {
  allAchievements: [],
};

export const achievementsSlice = createSlice({
  name: "achievements",
  initialState,
  reducers: {
    setAllAchievements: (state, action: PayloadAction<Achievement[]>) => {
      state.allAchievements = action.payload;
    },
    updateAchievementClaimed: (
      state,
      action: PayloadAction<{ id: string; claimed_at: string }>
    ) => {
      const achievement = state.allAchievements.find(
        (a) => a.id === action.payload.id
      );
      if (achievement) {
        achievement.is_claimed = true;
        achievement.claimed_at = action.payload.claimed_at;
      }
    },
  },
});

export const { setAllAchievements, updateAchievementClaimed } =
  achievementsSlice.actions;

export default achievementsSlice.reducer;
