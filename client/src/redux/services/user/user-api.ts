import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import type { IUser, IHiltiDetail } from "../../../types";
import { loadingUser } from "../../slices/userSlice";
import { getMinerOnLoading } from "../../slices/minerSlice";
import { setHiltiData } from "../../slices/hiltiSlice";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/user`),
  endpoints: (builder) => ({
    loading: builder.mutation<
      {
        user: IUser;
        hiltis: IHiltiDetail[];
        message: string;
      },
      { user: Partial<IUser> }
    >({
      query: (body: { user: Partial<IUser> }) => ({
        url: `/loading/${body.user._id}`,
        method: "POST",
        body: body.user,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Loading data received:", data);

          // Dispatch user data
          dispatch(loadingUser(data.user));

          // Dispatch miner data
          dispatch(getMinerOnLoading(data.user.game_data.miner_data));

          // Dispatch hilti data with all hiltis
          dispatch(
            setHiltiData({
              current_hilti: data.user.game_data.hilti_data
                .hilti as IHiltiDetail,
              current_energy: data.user.game_data.hilti_data.current_energy,
              last_energy_refill:
                data.user.game_data.hilti_data.last_energy_refill,
              all_hiltis: data.hiltis,
            })
          );
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      },
    }),
  }),
});

export const { useLoadingMutation } = userApi;
