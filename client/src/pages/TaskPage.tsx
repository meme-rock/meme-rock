import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { ETaskType, ITask } from "../types";
import {
  useVerifyDailyTaskMutation,
  useClaimDailyTaskMutation,
} from "../redux/services/tasks/task-api";
import WebApp from "@twa-dev/sdk";
import { TaskSection } from "../components/task/TaskSection";
import { EUserTaskStatus } from "../types/enums";

export const TaskPage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const [verifyDaily] = useVerifyDailyTaskMutation();
  const [claimDaily] = useClaimDailyTaskMutation();
  /* const [claimCommon] = useClaimCommonTaskMutation();
  const [claimReusable] = useClaimReusableTaskMutation();
  const [claimPartner] = useClaimPartnerTaskMutation(); */

  const handleClaim = async (task: ITask) => {
    setLoadingTaskId(task._id);
    try {
      let response;
      const payload = { user_id: user._id, task_id: task._id };

      switch (task.task_type) {
        case ETaskType.DAILY:
          switch (task.status) {
            case EUserTaskStatus.PENDING:
              response = await verifyDaily(payload).unwrap();
              break;
            case EUserTaskStatus.READY_TO_CLAIM:
              response = await claimDaily(payload).unwrap();
              break;
            default:
              break;
          }
      }
    } catch (error: any) {
      console.error("Failed to claim task:", error);
      WebApp.showAlert(error?.data?.message || "Failed to claim task");
    } finally {
      setLoadingTaskId(null);
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
          onClaim={handleClaim}
          loadingTaskId={loadingTaskId}
        />
        <TaskSection
          title="Partner Tasks"
          tasks={partnerTasks}
          onClaim={handleClaim}
          loadingTaskId={loadingTaskId}
        />
        <TaskSection
          title="Common Tasks"
          tasks={commonTasks}
          onClaim={handleClaim}
          loadingTaskId={loadingTaskId}
        />
        <TaskSection
          title="Reusable Tasks"
          tasks={reusableTasks}
          onClaim={handleClaim}
          loadingTaskId={loadingTaskId}
        />
      </div>
    </div>
  );
};

export default TaskPage;
