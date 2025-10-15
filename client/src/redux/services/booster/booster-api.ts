import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import { getBoosters, updateSingleBooster } from "../../slices/boosterSlice";
import { updateUserFromBoosterAction } from "../../slices/userSlice";

export const boosterApi = createApi({
  reducerPath: "boosterApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/user-booster`),
  endpoints: (builder) => ({
    getBoosters: builder.mutation({
      query: ({ user_id }: { user_id: string }) => ({
        url: `/get-boosters/${user_id}`,
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          // Mutasyon başarıyla tamamlandığında
          console.log("📥 getBoosters Arg: ", arg);
          const { data } = await queryFulfilled;
          console.log("✅ getBoosters data received:", data.length, "boosters");
          // boosterSlice'tan gelen getBoosters action'ını çağır
          dispatch(getBoosters(data));
        } catch (error) {
          console.log("❌ getBoosters error: ", error);
        }
      },
    }),
    unlockBooster: builder.mutation({
      query: ({
        user_id,
        booster_id,
      }: {
        user_id: string;
        booster_id: string;
      }) => ({
        url: `/unlock-booster/${user_id}`,
        method: "POST",
        body: { booster_id },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Booster unlocked successfully:", data);

          // User data'yı güncelle (bakiye, profit vb.)
          if (data.user) {
            dispatch(updateUserFromBoosterAction(data.user));
          }

          // Backend'den gelen güncellenmiş booster bilgisi ile state'i güncelle
          if (data.booster) {
            dispatch(updateSingleBooster(data.booster));
            console.log("🔄 Single booster updated:", data.booster);
          }
        } catch (error) {
          console.error("❌ Error unlocking booster:", error);
          throw error;
        }
      },
    }),
    upgradeBooster: builder.mutation({
      query: ({
        user_id,
        booster_id,
      }: {
        user_id: string;
        booster_id: string;
      }) => ({
        url: `/upgrade-booster/${user_id}`,
        method: "POST",
        body: { booster_id },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Booster upgraded successfully:", data);

          // User data'yı güncelle (bakiye, profit vb.)
          if (data.user) {
            dispatch(updateUserFromBoosterAction(data.user));
          }

          // Backend'den gelen güncellenmiş booster bilgisi ile state'i güncelle
          if (data.booster) {
            dispatch(updateSingleBooster(data.booster));
            console.log("🔄 Single booster updated:", data.booster);
          }
        } catch (error) {
          console.error("❌ Error upgrading booster:", error);
          throw error;
        }
      },
    }),
  }),
});

export const {
  useGetBoostersMutation,
  useUnlockBoosterMutation,
  useUpgradeBoosterMutation,
} = boosterApi;
