import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EMinerLevel, EMinerRewardType } from "../../types/enums";
import { IMinerDetail, IUserMinerState } from "../../types";

const initialState: IUserMinerState = {
  current_miner: {
    _id: EMinerLevel.LEVEL_1,
    profit_per_hour: 0,
    stone_price_to_upgrade: 0,
    reward_type: EMinerRewardType.STONE,
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
    upgradeMiner: (
      state,
      action: PayloadAction<{
        new_miner: IMinerDetail;
      }>
    ) => {
      state.current_miner = action.payload.new_miner;
    },
  },
});

export const { setMinerData, upgradeMiner } = minerSlice.actions;
export default minerSlice.reducer;
