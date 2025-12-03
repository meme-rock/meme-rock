import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import { TransactionResponse } from "./responses";

export const tonApi = createApi({
  reducerPath: "tonApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_TON_URL}/ton`),
  endpoints: (builder) => ({
    purchaseStonesWithTon: builder.mutation<
      TransactionResponse,
      { user_id: string; ton_price: number; wallet_address: string }
    >({
      query: ({ user_id, ton_price, wallet_address }) => ({
        url: `/purchase-stones/${user_id}`,
        method: "POST",
        body: { ton_price, wallet_address },
      }),
    }),
    purchasePremiumWithTon: builder.mutation<
      TransactionResponse,
      { user_id: string; wallet_address: string }
    >({
      query: ({ user_id, wallet_address }) => ({
        url: `/purchase-premium/${user_id}`,
        method: "POST",
        body: { wallet_address },
      }),
    }),
    purchaseBoosterWithTon: builder.mutation<
      TransactionResponse,
      { user_id: string; booster_id: string; wallet_address: string }
    >({
      query: ({ user_id, booster_id, wallet_address }) => ({
        url: `/purchase-booster/${user_id}`,
        method: "POST",
        body: { booster_id, wallet_address },
      }),
    }),
  }),
});

export const {
  usePurchaseStonesWithTonMutation,
  usePurchasePremiumWithTonMutation,
  usePurchaseBoosterWithTonMutation,
} = tonApi;
