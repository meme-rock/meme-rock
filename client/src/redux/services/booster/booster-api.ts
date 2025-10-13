import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";

import { getBoosters } from "../../slices/boosterSlice";
export const boosterApi = createApi({
  reducerPath: "boosterApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/user`),
  endpoints: (builder) => ({
    getBoosters: builder.mutation({
      query: () => ({
        url: `/get-boosters`,
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          // Mutasyon başarıyla tamamlandığında
          console.log("Arg: ", arg);
          const { data } = await queryFulfilled;
          console.log("loading data: ", data);
          // userSlice'tan gelen updateUserData action'ını çağır
          dispatch(getBoosters(data));
        } catch (error) {
          console.log("error: ", error);
        }
      },
    }),
  }),
});

export const { useGetBoostersMutation } = boosterApi;
