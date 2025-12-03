import { motion } from "framer-motion";
import { CheckCircle, Loader2, Clock } from "lucide-react";
import { ETaskAPIType, ETaskIcon, ITask } from "../../types";
import { formatInteger } from "../../utils/formatNumber";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  BsTwitterX,
  BsYoutube,
  BsTiktok,
  BsDiscord,
  BsFacebook,
  BsInstagram,
  BsTelegram,
} from "react-icons/bs";
import { EUserTaskStatus, ETaskType, ETaskDailyMatch } from "../../types/enums";

interface TaskItemProps {
  task: ITask;
  onAction: (task: ITask) => void;
  onClick: (task: ITask) => void;
  isLoading: boolean;
}

export const TaskItem = ({
  task,
  onAction,
  onClick,
  isLoading,
}: TaskItemProps) => {
  const user = useSelector((state: RootState) => state.user);

  const canClaimDailyAdTask = user.ad_data.ads_watched_daily >= task.limit!;
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onClick(task);
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAction(task);
  };

  const getIcon = (icon?: ETaskIcon) => {
    switch (icon) {
      case ETaskIcon.TELEGRAM:
        return <BsTelegram className="w-6 h-6 fill-current text-blue-400" />;
      case ETaskIcon.X:
        return <BsTwitterX className="w-6 h-6 fill-current text-white" />;
      case ETaskIcon.YOUTUBE:
        return <BsYoutube className="w-6 h-6 fill-current text-red-500" />;
      case ETaskIcon.TIKTOK:
        return <BsTiktok className="w-6 h-6 fill-current text-gray-100" />;
      case ETaskIcon.DISCORD:
        return <BsDiscord className="w-6 h-6 fill-current text-indigo-500" />;
      case ETaskIcon.FACEBOOK:
        return <BsFacebook className="w-6 h-6 fill-current text-blue-600" />;
      case ETaskIcon.INSTAGRAM:
        return <BsInstagram className="w-6 h-6 fill-current text-pink-500" />;
      default:
        return <CheckCircle className="w-6 h-6 text-purple-500" />;
    }
  };

  const renderActionButton = (status: EUserTaskStatus) => {
    // Task already claimed
    if (status === EUserTaskStatus.CLAIMED) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-500 font-semibold text-xs">
            Completed
          </span>
        </div>
      );
    }

    // Task ready to claim
    if (status === EUserTaskStatus.READY_TO_CLAIM) {
      return (
        <motion.button
          whileTap={{ scale: 0.95 }} // Tıklanınca %5 küçülme efekti
          onClick={handleAction}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-lg font-bold text-sm bg-green-500/40 border border-green-500/10 text-white hover:bg-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] flex justify-center items-center"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Claim"}
        </motion.button>
      );
    }

    // API-based task or Daily Task that needs verification
    if (
      (task.api_type !== ETaskAPIType.NONE ||
        task.task_type === ETaskType.DAILY) &&
      task.status === EUserTaskStatus.PENDING
    ) {
      const isAdTask = task.daily_task_match === ETaskDailyMatch.ADS_WATCHED;
      const isDisabled = isLoading || (isAdTask && !canClaimDailyAdTask);

      return (
        <motion.button
          whileTap={{ scale: 0.95 }} // Tıklama efekti
          onClick={handleAction}
          disabled={isDisabled}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm border transition-all min-w-[90px] flex justify-center items-center ${
            isDisabled
              ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed"
              : "bg-blue-500/40 border-blue-500/10 text-white hover:bg-blue-500/20"
          }`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
        </motion.button>
      );
    }

    // Fake mode task - no button, just clickable card
    return null;
  };

  // Determine if card should be clickable
  const isClickable = task.link;

  // Determine opacity
  const cardOpacity =
    task.status === EUserTaskStatus.CLAIMED ? "opacity-60" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleCardClick}
      className={`bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800/50 rounded-2xl p-4 relative overflow-hidden group transition-all ${cardOpacity} ${
        isClickable ? "cursor-pointer hover:border-gray-700/50" : ""
      }`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between relative z-10 gap-3">
        {/* Left: Icon & Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0 border border-gray-700/50">
            {getIcon(task.icon)}
          </div>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm leading-tight mb-1.5 line-clamp-2">
              {task.title}
            </h3>

            {/* Reward */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                <img src="/stone.svg" alt="Stone" className="w-4 h-4" />
                <span className="text-cyan-400 font-bold text-xs">
                  +{formatInteger(task.reward)}
                </span>
              </div>

              {/* Ad Watch Progress */}
              {task.limit && (
                <span className="text-gray-400 text-xs font-medium bg-gray-800/50 px-2 py-1 rounded-lg">
                  {user.ad_data.ads_watched_daily}/{task.limit}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="flex items-center shrink-0">
          {renderActionButton(task.status)}
        </div>
      </div>

      {/* Moderator Approval Message */}
      {task.api_type === ETaskAPIType.NONE &&
        task.status === EUserTaskStatus.VERIFYING &&
        (task.remaining_seconds || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 overflow-hidden"
          >
            <div className="flex items-start gap-2 text-xs bg-amber-500/10 text-amber-400 p-3 rounded-xl border border-amber-500/20">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">Awaiting moderator approval.</p>
            </div>
          </motion.div>
        )}
    </motion.div>
  );
};
