import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";

export const starApi = createApi({
  reducerPath: "starApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/star`),
  endpoints: (builder) => ({
    purchaseBoosterWithStars: builder.mutation({
      query: ({
        user_id,
        booster_id,
      }: {
        user_id: string;
        booster_id: string;
      }) => ({
        url: `/purchase-booster/${user_id}`,
        method: "POST",
        body: { booster_id },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("✅ purchaseBoosterWithStars data received:", data);
          return data;
        } catch (error) {
          console.log("❌ purchaseBoosterWithStars error: ", error);
          throw error;
        }
      },
    }),
    purchaseStonesWithStars: builder.mutation({
      query: ({
        user_id,
        stars_price,
      }: {
        user_id: string;
        stars_price: number;
      }) => ({
        url: `/purchase-stones/${user_id}`,
        method: "POST",
        body: { stars_price },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("✅ purchaseStonesWithStars data received:", data);
          return data;
        } catch (error) {
          console.log("❌ purchaseStonesWithStars error: ", error);
          throw error;
        }
      },
    }),
    purchasePremiumWithStars: builder.mutation({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/purchase-premium/${user_id}`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("✅ purchasePremiumWithStars data received:", data);
          return data;
        } catch (error) {
          console.log("❌ purchasePremiumWithStars error: ", error);
          throw error;
        }
      },
    }),
  }),
});

export const {
  usePurchaseBoosterWithStarsMutation,
  usePurchaseStonesWithStarsMutation,
  usePurchasePremiumWithStarsMutation,
} = starApi;
