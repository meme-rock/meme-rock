import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ITask } from "../../types";
import { EUserTaskStatus } from "../../types/enums";

interface TaskState {
  tasks: ITask[];
}

const initialState: TaskState = {
  tasks: [],
};

export const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<ITask[]>) => {
      state.tasks = action.payload;
    },
    updateTaskStatus: (
      state,
      action: PayloadAction<{
        task_id: string;
        status: EUserTaskStatus;
        remaining_seconds?: number;
      }>
    ) => {
      const task = state.tasks.find((t) => t._id === action.payload.task_id);
      if (task) {
        task.status = action.payload.status;
        task.remaining_seconds = action.payload.remaining_seconds || 0;
      }
    },
  },
});

export const { setTasks, updateTaskStatus } = taskSlice.actions;
export default taskSlice.reducer;
