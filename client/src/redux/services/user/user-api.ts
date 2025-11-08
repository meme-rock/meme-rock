import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import type { IUser, IHiltiDetail, IMinerDetail } from "../../../types";
import {
  loadingUser,
  updateUserDust,
  updateUserOnDustToStoneExchange,
  updateUserOnStoneToDustExchange,
  updateUserStones,
  updateUserFromMine,
} from "../../slices/userSlice";
import { setMinerData, upgradeMiner } from "../../slices/minerSlice";
import { setHiltiData, upgradeHilti } from "../../slices/hiltiSlice";
import { MineResponse } from "./responses";

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

          // Store mine claim data if available
          if (data.mine_claim) {
            dispatch({
              type: "mineClaim/setMineClaimData",
              payload: data.mine_claim,
            });
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
    mine: builder.mutation<MineResponse, { user_id: string }>({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/mine/${user_id}`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Mine data received:", data);

          // Update Redux with new stone/dust balance and mining data
          dispatch(
            updateUserFromMine({
              stone: data.balance_data.stone,
              dust: data.balance_data.dust,
              last_mine: data.miner_data.last_mine,
              next_mine: data.miner_data.next_mine,
              claimable_periods: data.miner_data.claimable_periods,
            })
          );
        } catch (error) {
          console.error("Error mining:", error);
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
    upgradeMiner: builder.mutation<
      {
        success: boolean;
        data: {
          new_miner_level: string;
          new_stone_balance: number;
          miner: IMinerDetail;
        };
      },
      { user_id: string }
    >({
      query: ({ user_id }) => ({
        url: `/upgrade-miner/${user_id}`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Miner upgraded successfully:", data);

          // Update Redux with new miner
          dispatch(
            upgradeMiner({
              new_miner: data.data.miner,
            })
          );

          // Update stone balance
          dispatch(
            updateUserStones({
              stones: data.data.new_stone_balance,
            })
          );
        } catch (error) {
          console.error("Error upgrading miner:", error);
          throw error;
        }
      },
    }),
    upgradeHilti: builder.mutation<
      {
        success: boolean;
        data: {
          new_hilti_level: string;
          new_stone_balance: number;
          new_profit_per_hour: number;
          hilti: IHiltiDetail;
        };
      },
      { user_id: string }
    >({
      query: ({ user_id }) => ({
        url: `/upgrade-hilti/${user_id}`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Hilti upgraded successfully:", data);

          // Update Redux with new hilti
          dispatch(
            upgradeHilti({
              new_hilti: data.data.hilti,
            })
          );

          // Update user state
          const state = getState() as any;
          const updatedUser = {
            ...state.user,
            balance_data: {
              ...state.user.balance_data,
              stone: data.data.new_stone_balance,
            },
            airdrop_data: {
              ...state.user.airdrop_data,
              profit_per_hour: data.data.new_profit_per_hour,
            },
          };

          dispatch(loadingUser(updatedUser));
        } catch (error) {
          console.error("Error upgrading hilti:", error);
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
  useMineMutation,
  useClaimAchievementMutation,
  useUpgradeMinerMutation,
  useUpgradeHiltiMutation,
} = userApi;
