import { createSlice, PayloadAction } from "@reduxjs/toolkit";
type IStatsState = {
  total_mined: number;
  total_participants: number;
};

const initialState: IStatsState = {
  total_mined: 0,
  total_participants: 0,
};
export const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    getStats: (state, action: PayloadAction<IStatsState>) => {
      state.total_mined = action.payload.total_mined;
      state.total_participants = action.payload.total_participants;
    },
  },
});

export const { getStats } = statsSlice.actions;
export default statsSlice.reducer;
