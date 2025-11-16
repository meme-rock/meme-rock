import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";

export type LeaderboardUser = {
  _id: string;
  username: string;
  photoUrl: string;
  rank: number;
  airdropCoins: number;
  profitPerHour: number;
  isPremium: boolean;
  minerLevel: number;
  hiltiLevel: number;
  inviteCount: number;
};

export type LeaderboardResponse = {
  leaderboard: LeaderboardUser[];
  currentUserRank: number;
};

export type WeeklyInviteLeaderboardUser = {
  _id: string;
  username: string;
  photoUrl?: string;
  rank: number;
  inviteCount: number;
};

export const ranksApi = createApi({
  reducerPath: "ranksApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/ranks`),
  endpoints: (builder) => ({
    getLeaderboard: builder.query<LeaderboardResponse, string>({
      query: (userId: string) => ({
        url: `/get-leaderboard/${userId}`,
        method: "GET",
      }),
    }),
    getWeeklyInvitesLeaderboard: builder.query<
      WeeklyInviteLeaderboardUser[],
      void
    >({
      query: () => ({
        url: `/get-weekly-invites-leaderboard`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetLeaderboardQuery,
  useLazyGetLeaderboardQuery,
  useGetWeeklyInvitesLeaderboardQuery,
} = ranksApi;
