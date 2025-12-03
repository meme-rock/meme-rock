import { ITask } from "../../types";
import { TaskItem } from "./TaskItem";

interface TaskSectionProps {
  title: string;
  tasks: ITask[];
  onAction: (task: ITask) => void;
  onClick: (task: ITask) => void;
  loadingTaskId: string | null;
  headerRight?: React.ReactNode;
}

export const TaskSection = ({
  title,
  tasks,
  onAction,
  onClick,
  loadingTaskId,
  headerRight,
}: TaskSectionProps) => {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex-1">
          {title}
        </h2>
        {headerRight}
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
