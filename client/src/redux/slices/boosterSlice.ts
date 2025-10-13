import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IBooster } from "../../types";

type BoosterState = IBooster[];

const initialState: BoosterState = [];

export const boosterSlice = createSlice({
  name: "booster",
  initialState,
  reducers: {
    getBoosters: (state, action: PayloadAction<BoosterState>) => {
      console.log("getBoosters action.payload: ", action.payload);
      console.log("getBoosters state before: ", state);
      return action.payload;
    },
  },
});

export const { getBoosters } = boosterSlice.actions;
export default boosterSlice.reducer;
