import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IHilti } from "../../types";
import { EHiltiLevel } from "../../types/enums";

type HiltiState = IHilti;

const initialState: HiltiState = {
  hilti: {
    _id: EHiltiLevel.LEVEL_1,
    rock_income: 0,
    upgrade_requirements: {},
    max_energy: 0,
  },
  current_energy: 0,
  last_energy_refill: new Date(),
};

export const hiltiSlice = createSlice({
  name: "hilti",
  initialState,
  reducers: {
    getHiltiOnLoading: (state, action: PayloadAction<HiltiState>) => {
      console.log("getHiltiOnLoading action.payload: ", action.payload);
      console.log("getHiltiOnLoading state before: ", state);
      return action.payload;
    },
  },
});

export const { getHiltiOnLoading } = hiltiSlice.actions;
export default hiltiSlice.reducer;
