import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import { DailyRewardResponse } from "./responses";
import {
  updateUserBalance,
  updateUserDailyRewardData,
} from "../../slices/userSlice";

export const dailyRewardApi = createApi({
  reducerPath: "dailyRewardApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/daily-reward`),
  endpoints: (builder) => ({
    claimDailyReward: builder.mutation<
      DailyRewardResponse,
      { user_id: string }
    >({
      query: ({ user_id }) => ({
        url: `/claim/${user_id}`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Claim data received:", data);
          dispatch(updateUserDailyRewardData(data.daily_reward_data));
          dispatch(updateUserBalance(data.balance));
        } catch (error) {
          console.error("Error claiming:", error);
        }
      },
    }),
  }),
});

export const { useClaimDailyRewardMutation } = dailyRewardApi;
