import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IMiner } from "../../types";
import { EMinerLevel } from "../../types/enums";

type MinerState = IMiner;

const initialState: MinerState = {
  _id: EMinerLevel.LEVEL_1,
  stones_income: 0,
  spent_stones_to_upgrade: 0,
};

export const minerSlice = createSlice({
  name: "miner",
  initialState,
  reducers: {
    getMinerOnLoading: (state, action: PayloadAction<MinerState>) => {
      console.log("getMinerOnLoading action.payload: ", action.payload);
      console.log("getMinerOnLoading state before: ", state);
      return action.payload;
    },
  },
});

export const { getMinerOnLoading } = minerSlice.actions;
export default minerSlice.reducer;
