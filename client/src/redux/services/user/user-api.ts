import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import type { IUser, IHiltiDetail, IMinerDetail } from "../../../types";
import {
  loadingUser,
  setPremiumMarketItem,
  setIsPremium,
  updateUserDust,
  updateUserOnDustToStoneExchange,
  updateUserOnStoneToDustExchange,
  updateUserStones,
} from "../../slices/userSlice";
import { setMinerData } from "../../slices/minerSlice";
import { setHiltiData } from "../../slices/hiltiSlice";
import { BalanceData } from "./responses";
import {
  ETaskAPIType,
  ETaskDailyMatch,
  ETaskIcon,
  ETaskType,
  EUserTaskStatus,
} from "../../../types/enums";
import { setTasks } from "../../slices/taskSlice";

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
        tasks: Array<{
          _id: string;
          task_type: ETaskType;
          title: string;
          daily_task_match?: ETaskDailyMatch;
          limit?: number;
          link?: string;
          icon?: ETaskIcon;
          api_type: ETaskAPIType;
          reward: number;

          createdAt: Date;
          updatedAt: Date;
          status: EUserTaskStatus;
          remaining_seconds?: number;
        }>;
        premium_market_item?: {
          ton_price: number;
          stars_price: number;
        };
        mine_claim?: {
          success: boolean;
          claimed_reward: number;
          reward_type: string;
          periods_claimed: number;
          last_mine?: string;
          next_mine: string;
          mining_cooldown_ms: number;
          message: string;
          new_stone_balance?: number;
          new_dust_balance?: number;
          new_last_mine?: string;
        } | null;
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
          const minerData = data.user.miner_data;
          const currentMiner: IMinerDetail = minerData.miner; //
          dispatch(
            setMinerData({
              current_miner: currentMiner,
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

          // Store tasks in Redux
          dispatch(setTasks(data.tasks));

          // Store mine claim data if available
          if (data.mine_claim) {
            dispatch({
              type: "mineClaim/setMineClaimData",
              payload: data.mine_claim,
            });
          }

          // Store premium market item if available
          if (data.premium_market_item) {
            dispatch(setPremiumMarketItem(data.premium_market_item));
          }
        } catch (error) {
          console.error("Error loading user data:", error);
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

    claimAchievement: builder.mutation<
      {
        success: boolean;
        achievement_id: string;
        new_stone_balance: number;
        achievements: Array<{
          id: string;
          claimed_at: string;
        }>;
      },
      { user_id: string; achievement_id: string }
    >({
      query: ({ user_id, achievement_id }) => ({
        url: `/claim-achievement/${user_id}`,
        method: "POST",
        body: { achievement_id },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Achievement claimed:", data);

          // Update Redux with new stone balance
          dispatch(
            updateUserStones({
              stones: data.new_stone_balance,
            })
          );

          // Find the claimed achievement to get the claimed_at date
          const claimedAchievement = data.achievements.find(
            (a) => a.id === data.achievement_id
          );

          if (claimedAchievement) {
            // Update achievements slice with claimed status
            dispatch({
              type: "achievements/updateAchievementClaimed",
              payload: {
                id: data.achievement_id,
                claimed_at: claimedAchievement.claimed_at,
              },
            });
          }
        } catch (error) {
          console.error("Error claiming achievement:", error);
        }
      },
    }),
    getBalanceData: builder.mutation<BalanceData, { user_id: string }>({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/get-balance-data/${user_id}`,
        method: "GET",
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Balance data received:", data);
          dispatch(
            updateUserStones({
              stones: data.stone,
            })
          );
        } catch (error) {
          console.log("❌ getBalanceData error: ", error);
          throw error;
        }
      },
    }),
    isPremium: builder.mutation<boolean, { user_id: string }>({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/is-premium/${user_id}`,
        method: "GET",
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Is premium data received:", data);
          dispatch(setIsPremium(data));
        } catch (error) {
          console.log("❌ isPremium error: ", error);
          throw error;
        }
      },
    }),
  }),
});

export const {
  useLoadingMutation,
  useUpdateUserDustAfterAdRewardMutation,
  useStoneToDustExchangeMutation,
  useDustToStoneExchangeMutation,
  useClaimAchievementMutation,
  useGetBalanceDataMutation,
  useIsPremiumMutation,
} = userApi;
