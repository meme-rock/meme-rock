import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import type { IUser, IHiltiDetail, IMinerDetail } from "../../../types";
import {
  loadingUser,
  updateUserDust,
  updateUserOnDustToStoneExchange,
  updateUserOnStoneToDustExchange,
  updateUserStones,
} from "../../slices/userSlice";
import { setMinerData } from "../../slices/minerSlice";
import { setHiltiData } from "../../slices/hiltiSlice";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/user`),
  endpoints: (builder) => ({
    loading: builder.mutation<
      {
        user: IUser;
        hiltis: IHiltiDetail[];
        miners: IMinerDetail[];
        achievements: Array<{
          id: string;
          title: string;
          description: string;
          stone_reward?: number;
          is_claimed: boolean;
          claimed_at?: string;
        }>;
        message: string;
      },
      { user: Partial<IUser> }
    >({
      query: (body: { user: Partial<IUser> }) => ({
        url: `/loading/${body.user._id}`,
        method: "POST",
        body: body.user,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Loading data received:", data);

          // Dispatch user data
          dispatch(loadingUser(data.user));

          // Dispatch miner data
          dispatch(
            setMinerData({
              current_miner: data.user.miner_data
                .miner as unknown as IMinerDetail,
              all_miners: data.miners,
            })
          );

          // Dispatch hilti data with all hiltis
          dispatch(
            setHiltiData({
              current_hilti: data.user.hilti_data
                .hilti as unknown as IHiltiDetail,
              all_hiltis: data.hiltis,
            })
          );

          // Store achievements in Redux
          dispatch({
            type: "achievements/setAllAchievements",
            payload: data.achievements || [],
          });
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      },
    }),
    mineDailyStoneReward: builder.mutation<
      {
        balance_data: { stone: number };
        miner_data: { last_mine: string };
      },
      { user_id: string }
    >({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/mine-daily-stone-reward/${user_id}`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Mine daily stone reward data received:", data);

          // Update Redux with new stone balance and last_mine timestamp
          dispatch(
            updateUserStones({
              stones: data.balance_data.stone,
              last_mine: data.miner_data.last_mine,
            })
          );
        } catch (error) {
          console.error("Error mining daily stone reward:", error);
        }
      },
    }),
    updateUserDustAfterAdReward: builder.mutation({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/get-balance-after-ad-reward/${user_id}`,
        method: "GET",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Update user dust data received:", data);
          dispatch(updateUserDust(data));
        } catch (error) {
          console.error("Error updating user dust data:", error);
        }
      },
    }),
    StoneToDustExchange: builder.mutation({
      query: ({ user_id, stones }: { user_id: string; stones: number }) => ({
        url: `/stone-to-dust-exchange/${user_id}`,
        method: "POST",
        body: { stones },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(
            "Update user on stone to dust exchange data received:",
            data
          );
          dispatch(
            updateUserOnStoneToDustExchange({
              dust: data.game_data.dust,
              stones: data.game_data.stones,
            })
          );
        } catch (error) {
          console.error(
            "Error updating user on stone to dust exchange data:",
            error
          );
        }
      },
    }),
    DustToStoneExchange: builder.mutation({
      query: ({ user_id, dust }: { user_id: string; dust: number }) => ({
        url: `/dust-to-stone-exchange/${user_id}`,
        method: "POST",
        body: { dust },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(
            "Update user on dust to stone exchange data received:",
            data
          );
          dispatch(
            updateUserOnDustToStoneExchange({
              dust: data.game_data.dust,
              stones: data.game_data.stones,
            })
          );
        } catch (error) {
          console.error(
            "Error updating user on dust to stone exchange data:",
            error
          );
        }
      },
    }),
    mineStone: builder.mutation<
      {
        new_stone_balance: number;
        last_mine: string;
        remaining_time_seconds: number;
      },
      { user_id: string }
    >({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/mine-stone/${user_id}`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Mine stone data received:", data);

          // Update Redux with new stone balance and last_mine timestamp
          dispatch(
            updateUserStones({
              stones: data.new_stone_balance,
              last_mine: data.last_mine,
            })
          );
        } catch (error) {
          console.error("Error mining stone:", error);
        }
      },
    }),
    claimAchievement: builder.mutation<
      {
        success: boolean;
        achievement_id: string;
        stone_reward: number;
        new_balance: number;
        achievements: Array<{
          achievement_id: string;
          is_claimed: boolean;
          claimed_at?: string;
        }>;
      },
      { user_id: string; achievement_id: string }
    >({
      query: ({ user_id, achievement_id }) => ({
        url: `/claim-achievement/${user_id}/${achievement_id}`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Achievement claimed:", data);

          // Update Redux with new stone balance
          dispatch(
            updateUserStones({
              stones: data.new_balance,
            })
          );

          // Update achievements in Redux
          dispatch({
            type: "user/updateUserAchievements",
            payload: data.achievements,
          });

          // Update achievements slice with claimed status
          dispatch({
            type: "achievements/updateAchievementClaimed",
            payload: {
              id: data.achievement_id,
              claimed_at: new Date().toISOString(),
            },
          });
        } catch (error) {
          console.error("Error claiming achievement:", error);
        }
      },
    }),
  }),
});

export const {
  useLoadingMutation,
  useMineDailyStoneRewardMutation,
  useUpdateUserDustAfterAdRewardMutation,
  useStoneToDustExchangeMutation,
  useDustToStoneExchangeMutation,
  useMineStoneMutation,
  useClaimAchievementMutation,
} = userApi;
