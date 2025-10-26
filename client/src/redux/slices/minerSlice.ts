import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EMinerLevel } from "../../types/enums";
import { IMinerDetail, IUserMinerState } from "../../types";

const initialState: IUserMinerState = {
  current_miner: {
    _id: EMinerLevel.LEVEL_1,
    profit_per_hour: 0,
    spent_stones_to_upgrade: 0,
    upgrade_requirements: {},
  },
  all_miners: [],
};

export const minerSlice = createSlice({
  name: "miner",
  initialState,
  reducers: {
    setMinerData: (
      state,
      action: PayloadAction<{
        current_miner: IMinerDetail;
        all_miners: IMinerDetail[];
      }>
    ) => {
      state.current_miner = action.payload.current_miner;
      state.all_miners = action.payload.all_miners;
    },
  },
});

export const { setMinerData } = minerSlice.actions;
export default minerSlice.reducer;
