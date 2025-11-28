import { ITask } from "../../types";
import { TaskItem } from "./TaskItem";

interface TaskSectionProps {
  title: string;
  tasks: ITask[];
  onAction: (task: ITask) => void;
  onClick: (task: ITask) => void;
  loadingTaskId: string | null;
}

export const TaskSection = ({
  title,
  tasks,
  onAction,
  onClick,
  loadingTaskId,
}: TaskSectionProps) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {title}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent" />
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onAction={onAction}
            onClick={onClick}
            isLoading={loadingTaskId === task._id}
          />
        ))}
      </div>
    </div>
  );
};
