import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserHiltiState, IHiltiDetail } from "../../types";
import { EHiltiLevel } from "../../types/enums";

const initialState: IUserHiltiState = {
  current_hilti: {
    _id: EHiltiLevel.LEVEL_1,
    rock_income: 0,
    max_energy: 0,
    upgrade_requirements: {},
  },
  current_energy: 0,
  last_energy_refill: new Date(),
  all_hiltis: [],
};

export const hiltiSlice = createSlice({
  name: "hilti",
  initialState,
  reducers: {
    setHiltiData: (
      state,
      action: PayloadAction<{
        current_hilti: IHiltiDetail;
        current_energy: number;
        last_energy_refill: Date;
        all_hiltis: IHiltiDetail[];
      }>
    ) => {
      state.current_hilti = action.payload.current_hilti;
      state.current_energy = action.payload.current_energy;
      state.last_energy_refill = action.payload.last_energy_refill;
      state.all_hiltis = action.payload.all_hiltis;
    },
    updateEnergy: (state, action: PayloadAction<number>) => {
      state.current_energy = action.payload;
    },
  },
});

export const { setHiltiData, updateEnergy } = hiltiSlice.actions;
export default hiltiSlice.reducer;
