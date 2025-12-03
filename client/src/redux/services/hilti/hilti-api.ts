import { createApi } from "@reduxjs/toolkit/query/react";
import { UpgradeResponse } from "./responses";
import { initDataHeader } from "../init-data-header";
import { upgradeHilti } from "../../slices/hiltiSlice";
import { loadingUser } from "../../slices/userSlice";

export const hiltiApi = createApi({
  reducerPath: "hiltiApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/hilti`),
  endpoints: (builder) => ({
    upgradeHilti: builder.mutation<UpgradeResponse, { user_id: string }>({
      query: ({ user_id }) => ({
        url: `/upgrade/${user_id}`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Hilti upgraded successfully:", data);

          // Update Redux with new hilti
          dispatch(
            upgradeHilti({
              new_hilti: data.data.hilti,
            })
          );

          // Update user state
          const state = getState() as any;
          const updatedUser = {
            ...state.user,
            balance_data: {
              ...state.user.balance_data,
              stone: data.data.new_stone_balance,
            },
            airdrop_data: {
              ...state.user.airdrop_data,
              profit_per_hour: data.data.new_profit_per_hour,
            },
          };

          dispatch(loadingUser(updatedUser));
        } catch (error) {
          console.error("Error upgrading hilti:", error);
          throw error;
        }
      },
    }),
  }),
});

export const { useUpgradeHiltiMutation } = hiltiApi;
