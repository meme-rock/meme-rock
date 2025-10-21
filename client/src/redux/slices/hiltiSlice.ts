import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUserHiltiState, IHiltiDetail } from "../../types";
import { EHiltiLevel } from "../../types/enums";

const initialState: IUserHiltiState = {
  current_hilti: {
    _id: EHiltiLevel.LEVEL_1,
    profit_per_hour: 0,
    upgrade_requirements: {},
  },
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
        all_hiltis: IHiltiDetail[];
      }>
    ) => {
      state.current_hilti = action.payload.current_hilti;
      state.all_hiltis = action.payload.all_hiltis;
    },
  },
});

export const { setHiltiData } = hiltiSlice.actions;
export default hiltiSlice.reducer;
