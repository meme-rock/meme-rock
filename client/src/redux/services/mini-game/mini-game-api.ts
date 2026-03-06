import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import type {
  MiniGameStateResponse,
  StartSessionResponse,
  EndSessionResponse,
  UpgradeResponse,
  AdRewardResponse,
  MiniGameCatalogResponse,
} from "./responses";

export const miniGameApi = createApi({
  reducerPath: "miniGameApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/mini-game`),
  endpoints: (builder) => ({
    getCatalog: builder.query<MiniGameCatalogResponse, void>({
      query: () => ({
        url: "/catalog",
        method: "GET",
      }),
    }),

    getMiniGameState: builder.query<
      MiniGameStateResponse,
      { user_id: string; game_type: string }
    >({
      query: ({ user_id, game_type }) => ({
        url: `/state/${user_id}/${game_type}`,
        method: "GET",
      }),
    }),

    startSession: builder.mutation<
      StartSessionResponse,
      { user_id: string; game_type: string }
    >({
      query: ({ user_id, game_type }) => ({
        url: `/start/${user_id}/${game_type}`,
        method: "POST",
      }),
    }),

    endSession: builder.mutation<
      EndSessionResponse,
      { user_id: string; game_type: string; rocksSmashed: number }
    >({
      query: ({ user_id, game_type, rocksSmashed }) => ({
        url: `/end/${user_id}/${game_type}`,
        method: "POST",
        body: { rocksSmashed },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Error ending session:", error);
        }
      },
    }),

    upgradeMiniGame: builder.mutation<
      UpgradeResponse,
      { user_id: string; game_type: string; upgradeId: string }
    >({
      query: ({ user_id, game_type, upgradeId }) => ({
        url: `/upgrade/${user_id}/${game_type}`,
        method: "POST",
        body: { upgradeId },
      }),
    }),

    claimAdReward: builder.mutation<
      AdRewardResponse,
      { user_id: string; game_type: string }
    >({
      query: ({ user_id, game_type }) => ({
        url: `/ad-reward/${user_id}/${game_type}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetCatalogQuery,
  useGetMiniGameStateQuery,
  useLazyGetMiniGameStateQuery,
  useStartSessionMutation,
  useEndSessionMutation,
  useUpgradeMiniGameMutation,
  useClaimAdRewardMutation,
} = miniGameApi;
