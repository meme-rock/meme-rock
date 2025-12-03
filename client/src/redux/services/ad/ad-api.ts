import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import { updateUserAdData, updateUserBalance } from "../../slices/userSlice";
import { AfterAdRewardResponse } from "./responses";

export const adApi = createApi({
  reducerPath: "adApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/ad`),
  endpoints: (builder) => ({
    updateAfterAdReward: builder.mutation<
      AfterAdRewardResponse,
      { user_id: string }
    >({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/get-after-ad-reward/${user_id}`,
        method: "GET",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Update user ad data received:", data);
          dispatch(updateUserAdData(data.ad_data));
          dispatch(updateUserBalance(data.balance));
        } catch (error) {
          console.error("Error updating user ad data:", error);
        }
      },
    }),
  }),
});

export const { useUpdateAfterAdRewardMutation } = adApi;
