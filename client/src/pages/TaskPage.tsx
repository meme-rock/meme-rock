import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { ETaskType, ITask, ETaskAPIType } from "../types";
import {
  useVerifyDailyTaskMutation,
  useClaimDailyTaskMutation,
  useStartTaskMutation,
} from "../redux/services/tasks/task-api";
import WebApp from "@twa-dev/sdk";
import { TaskSection } from "../components/task/TaskSection";
import { EUserTaskStatus } from "../types/enums";

export const TaskPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const [verifyDaily] = useVerifyDailyTaskMutation();
  const [claimDaily] = useClaimDailyTaskMutation();
  const [startTask] = useStartTaskMutation();

  const handleTaskAction = async (task: ITask) => {
    setLoadingTaskId(task._id);
    try {
      const payload = { user_id: user._id, task_id: task._id };

      // Daily Task Logic
      if (task.task_type === ETaskType.DAILY) {
        if (task.status === EUserTaskStatus.PENDING) {
          await verifyDaily(payload).unwrap();
        } else if (task.status === EUserTaskStatus.READY_TO_CLAIM) {
          await claimDaily(payload).unwrap();
        }
        return;
      }

      // API-based Task Logic (TELEGRAM_API, X_API, etc.)
      if (task.api_type !== ETaskAPIType.NONE) {
        if (task.status === EUserTaskStatus.PENDING) {
          // TODO: Call verify API task endpoint
          // await verifyApiTask(payload).unwrap();
          console.log("Verify API task:", task._id);
        } else if (task.status === EUserTaskStatus.READY_TO_CLAIM) {
          await claimDaily(payload).unwrap();
        }
        return;
      }

      // Fake Mode Task Logic (NONE API type)
      if (task.api_type === ETaskAPIType.NONE) {
        if (task.status === EUserTaskStatus.READY_TO_CLAIM) {
          await claimDaily(payload).unwrap();
        }
        // PENDING and VERIFYING states don't have action buttons for fake mode
        return;
      }
    } catch (error: any) {
      console.error("Task action failed:", error);
      WebApp.showAlert(error?.data?.message || "An error occurred");
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleTaskClick = async (task: ITask) => {
    if (
      task.api_type === ETaskAPIType.NONE &&
      task.status === EUserTaskStatus.PENDING
    ) {
      const payload = { user_id: user._id, task_id: task._id };
      await startTask(payload).unwrap();
    }
    // Only open link for NONE API type tasks that are PENDING or VERIFYING
    if (task.link) {
      WebApp.openLink(task.link);
    }
  };

  const tasks = useSelector((state: RootState) => state.task.tasks);
  const dailyTasks = tasks.filter((t) => t.task_type === ETaskType.DAILY);
  const commonTasks = tasks.filter((t) => t.task_type === ETaskType.COMMON);
  const partnerTasks = tasks.filter((t) => t.task_type === ETaskType.PARTNER);
  const reusableTasks = tasks.filter((t) => t.task_type === ETaskType.REUSABLE);

  return (
    <div className="min-h-screen bg-black pb-24 pt-4 px-4">
      <div className="max-w-md mx-auto">
        <TaskSection
          title="Daily Tasks"
          tasks={dailyTasks}
          onAction={handleTaskAction}
          onClick={handleTaskClick}
          loadingTaskId={loadingTaskId}
        />
        <TaskSection
          title="Partner Tasks"
          tasks={partnerTasks}
          onAction={handleTaskAction}
          onClick={handleTaskClick}
          loadingTaskId={loadingTaskId}
        />
        <TaskSection
          title="Common Tasks"
          tasks={commonTasks}
          onAction={handleTaskAction}
          onClick={handleTaskClick}
          loadingTaskId={loadingTaskId}
        />
        <TaskSection
          title="Reusable Tasks"
          tasks={reusableTasks}
          onAction={handleTaskAction}
          onClick={handleTaskClick}
          loadingTaskId={loadingTaskId}
        />
      </div>
    </div>
  );
};

export default TaskPage;
