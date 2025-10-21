import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import type { IUser, IHiltiDetail, IMinerDetail } from "../../../types";
import {
  loadingUser,
  updateUserDust,
  updateUserOnDustToStoneExchange,
  updateUserOnStoneToDustExchange,
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
  }),
});

export const {
  useLoadingMutation,
  useUpdateUserDustAfterAdRewardMutation,
  useStoneToDustExchangeMutation,
  useDustToStoneExchangeMutation,
} = userApi;
