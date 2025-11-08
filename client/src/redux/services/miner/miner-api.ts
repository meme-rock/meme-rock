import { createApi } from "@reduxjs/toolkit/query/react";
import { updateUserFromMine, updateUserStones } from "../../slices/userSlice";
import { initDataHeader } from "../init-data-header";
import { MineResponse } from "./responses";
import { upgradeMiner } from "../../slices/minerSlice";
import { IMinerDetail } from "../../../types";

export const minerApi = createApi({
  reducerPath: "minerApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/miner`),
  endpoints: (builder) => ({
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
  }),
});

export const { useMineMutation, useUpgradeMinerMutation } = minerApi;
