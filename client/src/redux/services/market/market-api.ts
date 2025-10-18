import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";

export const marketApi = createApi({
  reducerPath: "marketApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/market`),
  endpoints: (builder) => ({
    loadStonesMarketData: builder.query({
      query: () => ({
        url: `/get-stones-market-data`,
        method: "GET",
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          return data;
        } catch (error) {
          console.log("❌ loadMarketData error: ", error);
        }
      },
    }),
    starsToStones: builder.mutation({
      query: ({
        user_id,
        stars_price,
      }: {
        user_id: string;
        stars_price: number;
      }) => ({
        url: `/purchase-stones-with-stars/${user_id}`,
        method: "POST",
        body: { stars_price },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          return data;
        } catch (error) {
          console.log("❌ starsToStones error: ", error);
        }
      },
    }),
    tonToStones: builder.mutation({
      query: ({
        user_id,
        stone_amount,
        wallet_address,
      }: {
        user_id: string;
        stone_amount: number;
        wallet_address: string;
      }) => ({
        url: `/purchase-stones-with-ton/${user_id}`,
        method: "POST",
        body: { stone_amount, wallet_address },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          return data;
        } catch (error) {
          console.log("❌ tonToStones error: ", error);
        }
      },
    }),
  }),
});

export const {
  useLoadStonesMarketDataQuery,
  useStarsToStonesMutation,
  useTonToStonesMutation,
} = marketApi;
