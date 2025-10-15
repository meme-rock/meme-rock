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
    updateSingleBooster: (state, action: PayloadAction<IBooster>) => {
      // Backend'den gelen güncellenmiş booster bilgisi ile state'i güncelle
      const index = state.findIndex((b) => b._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
        console.log("✅ Booster updated in state:", action.payload);
      }
    },
  },
});

export const { getBoosters, updateSingleBooster } = boosterSlice.actions;
export default boosterSlice.reducer;
