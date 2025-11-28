import { motion } from "framer-motion";
import { CheckCircle, ExternalLink, Tv, Loader2 } from "lucide-react";
import WebApp from "@twa-dev/sdk";
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
import { EUserTaskStatus } from "../../types/enums";

interface TaskItemProps {
  task: ITask;
  onClaim: (task: ITask) => void;
  isLoading: boolean;
}

export const TaskItem = ({ task, onClaim, isLoading }: TaskItemProps) => {
  const user = useSelector((state: RootState) => state.user);

  const handleOpenLink = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (task.link) {
      WebApp.openLink(task.link);
    }
  };

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClaim(task);
  };

  const getIcon = (icon?: ETaskIcon) => {
    switch (icon) {
      case ETaskIcon.TELEGRAM:
        return <BsTelegram className="w-6 h-6 fill-current text-blue-400" />;
      case ETaskIcon.X:
        return <BsTwitterX className="w-6 h-6 fill-current" />;
      case ETaskIcon.YOUTUBE:
        return <BsYoutube className="w-6 h-6 fill-current text-red-500" />;
      case ETaskIcon.TIKTOK:
        return <BsTiktok className="w-6 h-6 fill-current text-gray-100" />;
      case ETaskIcon.DISCORD:
        return <BsDiscord className="w-6 h-6 fill-current text-blue-500" />;
      case ETaskIcon.FACEBOOK:
        return <BsFacebook className="w-6 h-6 fill-current text-blue-500" />;
      case ETaskIcon.INSTAGRAM:
        return <BsInstagram className="w-6 h-6 fill-current text-red-500" />;
      default:
        return <Tv className="w-6 h-6 text-purple-500" />;
    }
  };

  const renderActionButton = () => {
    if (task.status === EUserTaskStatus.CLAIMED) {
      return (
        <button
          disabled
          className="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 bg-green-900/20 text-green-500 border border-green-900/50"
        >
          <CheckCircle className="w-4 h-4" />
          Done
        </button>
      );
    }

    if (task.status === EUserTaskStatus.READY_TO_CLAIM) {
      return (
        <button
          onClick={handleClaim}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg font-bold text-xs bg-cyan-600 text-white hover:bg-cyan-500 transition-colors min-w-[80px] flex justify-center"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Claim"}
        </button>
      );
    }

    // API Task Pending -> Check Button
    if (
      task.api_type !== ETaskAPIType.NONE &&
      task.status === EUserTaskStatus.PENDING
    ) {
      return (
        <button
          onClick={handleClaim}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg font-bold text-xs bg-gray-800 text-white hover:bg-gray-700 transition-colors min-w-[80px] flex justify-center"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
        </button>
      );
    }

    // None API Task Pending -> Start/Link Button
    if (
      task.api_type === ETaskAPIType.NONE &&
      task.status === EUserTaskStatus.PENDING
    ) {
      return (
        <button
          onClick={handleOpenLink}
          className="px-4 py-2 rounded-lg font-bold text-xs bg-gray-800 text-white hover:bg-gray-700 transition-colors min-w-[80px] flex items-center gap-2 justify-center"
        >
          Start
          <ExternalLink className="w-3 h-3" />
        </button>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleOpenLink}
      className={`bg-gray-900/50 border border-gray-800 rounded-xl p-4 relative overflow-hidden group cursor-pointer transition-colors hover:bg-gray-800/50 ${
        task.status === EUserTaskStatus.CLAIMED ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
            {getIcon(task.icon)}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{task.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <img src="/stone.svg" alt="Stone" className="w-4 h-4" />
                <span className="text-cyan-400 font-bold text-xs">
                  +{formatInteger(task.reward)}
                </span>
              </div>
              {task.limit && (
                <span className="text-gray-400 text-xs font-medium">
                  ({user.ad_data.ads_watched_today}/{task.limit})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">{renderActionButton()}</div>
      </div>

      {/* Verifying Message */}
      {task.api_type === ETaskAPIType.NONE &&
        task.status === EUserTaskStatus.VERIFYING &&
        (task.remaining_seconds || 0) > 0 && (
          <div className="mt-3 text-xs text-yellow-500/80 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
            Awaiting moderator approval. Please check back in a few minutes and
            ensure you have completed the task.
          </div>
        )}
    </motion.div>
  );
};
