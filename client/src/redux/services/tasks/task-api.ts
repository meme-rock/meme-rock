import { createApi } from "@reduxjs/toolkit/query/react";
import { initDataHeader } from "../init-data-header";
import { ClaimDailyTaskResponse, VerifyDailyTaskResponse } from "./responses";
import { updateUserBalance } from "../../slices/userSlice";
import { updateTaskStatus } from "../../slices/taskSlice";

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: initDataHeader(`${import.meta.env.VITE_API_URL}/task`),
  endpoints: (builder) => ({
    verifyDailyTask: builder.mutation<
      VerifyDailyTaskResponse,
      { user_id: string; task_id: string }
    >({
      query: ({ user_id, task_id }: { user_id: string; task_id: string }) => ({
        url: `/verify-daily-task/${user_id}`,
        method: "POST",
        body: { task_id },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Mine data received:", data);

          // update task status
          dispatch(
            updateTaskStatus({
              task_id: data.task._id,
              status: data.task.status,
            })
          );
        } catch (error) {
          console.error("Error mining:", error);
        }
      },
    }),
    claimDailyTask: builder.mutation<
      ClaimDailyTaskResponse,
      { user_id: string; task_id: string }
    >({
      query: ({ user_id, task_id }: { user_id: string; task_id: string }) => ({
        url: `/claim-daily-task/${user_id}`,
        method: "POST",
        body: { task_id },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("Claim data received:", data);

          dispatch(updateUserBalance(data.balance));
          // update task status
          dispatch(
            updateTaskStatus({
              task_id: data.task._id,
              status: data.task.status,
            })
          );
        } catch (error) {
          console.error("Error claiming:", error);
        }
      },
    }),
  }),
});

export const { useVerifyDailyTaskMutation, useClaimDailyTaskMutation } =
  taskApi;
