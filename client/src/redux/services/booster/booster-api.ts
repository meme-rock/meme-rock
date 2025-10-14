import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import { getBoosters } from "../../slices/boosterSlice";

export const boosterApi = createApi({
  reducerPath: "boosterApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/user-booster`),
  endpoints: (builder) => ({
    getBoosters: builder.mutation({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/get-boosters/${user_id}`,
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          // Mutasyon başarıyla tamamlandığında
          console.log("Arg: ", arg);
          const { data } = await queryFulfilled;
          console.log("loading data: ", data);
          // boosterSlice'tan gelen getBoosters action'ını çağır
          dispatch(getBoosters(data));
        } catch (error) {
          console.log("error: ", error);
        }
      },
    }),
    unlockBooster: builder.mutation({
      query: ({
        user_id,
        booster_id,
      }: {
        user_id: string;
        booster_id: string;
      }) => ({
        url: `/unlock-booster/${user_id}`,
        method: "POST",
        body: { booster_id },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Booster unlocked successfully: ", data);
          // Başarılı unlock sonrası user data'yı güncelleyebilirsiniz
        } catch (error) {
          console.error("Error unlocking booster: ", error);
        }
      },
    }),
  }),
});

export const { useGetBoostersMutation, useUnlockBoosterMutation } = boosterApi;
