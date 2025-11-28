import { ITask } from "../../types";
import { TaskItem } from "./TaskItem";

interface TaskSectionProps {
  title: string;
  tasks: ITask[];
  onClaim: (task: ITask) => void;
  loadingTaskId: string | null;
}

export const TaskSection = ({
  title,
  tasks,
  onClaim,
  loadingTaskId,
}: TaskSectionProps) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-400 mb-3 px-1">{title}</h2>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onClaim={onClaim}
            isLoading={loadingTaskId === task._id}
          />
        ))}
      </div>
    </div>
  );
};
