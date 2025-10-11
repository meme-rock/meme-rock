import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import type { IUser } from "../../../types";
import { loadingUser } from "../../slices/userSlice";
import { getMinerOnLoading } from "../../slices/minerSlice";
import { getHiltiOnLoading } from "../../slices/hiltiSlice";
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/user`),
  endpoints: (builder) => ({
    loading: builder.mutation({
      query: (body: { user: Partial<IUser> }) => ({
        url: `/loading/${body.user._id}`,
        method: "POST",
        body: body.user,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          // Mutasyon başarıyla tamamlandığında
          console.log("Arg: ", arg);
          const { data } = await queryFulfilled;
          console.log("loading data: ", data);
          // userSlice'tan gelen updateUserData action'ını çağır
          dispatch(loadingUser(data.user));
          dispatch(getMinerOnLoading(data.user.game_data.miner));
          dispatch(getHiltiOnLoading(data.user.game_data.hilti_data));
        } catch (error) {
          console.log("error: ", error);
        }
      },
    }),
  }),
});

export const { useLoadingMutation } = userApi;
