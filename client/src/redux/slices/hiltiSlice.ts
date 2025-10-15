import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserHiltiState, IHiltiDetail } from "../../types";
import { EHiltiLevel } from "../../types/enums";

const initialState: IUserHiltiState = {
  current_hilti: {
    _id: EHiltiLevel.LEVEL_1,
    rock_income: 0,
    upgrade_requirements: {},
  },
  last_claim: new Date(),
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
        last_claim: Date;
        all_hiltis: IHiltiDetail[];
      }>
    ) => {
      state.current_hilti = action.payload.current_hilti;
      state.last_claim = action.payload.last_claim;
      state.all_hiltis = action.payload.all_hiltis;
    },
    updateLastClaim: (state, action: PayloadAction<Date>) => {
      state.last_claim = action.payload;
    },
  },
});

export const { setHiltiData, updateLastClaim } = hiltiSlice.actions;
export default hiltiSlice.reducer;
