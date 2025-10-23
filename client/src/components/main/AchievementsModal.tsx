import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Trophy, CheckCircle2 } from "lucide-react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { ACHIEVEMENTS, Achievement } from "../../config/achievements";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal = ({
  isOpen,
  onClose,
}: AchievementsModalProps) => {
  const inviteCount = useSelector(
    (state: RootState) => state.user.invite_count,
    shallowEqual
  );

  const getAchievementStatus = (achievement: Achievement) => {
    const isCompleted = inviteCount >= achievement.requiredInvites;
    const progress = Math.min(
      (inviteCount / achievement.requiredInvites) * 100,
      100
    );
    return { isCompleted, progress };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 pb-20 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-purple-500/30 rounded-3xl w-full max-w-md shadow-xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 rounded-xl">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                      Achievements
                    </h2>
                    <p className="text-purple-300/70 text-xs font-medium mt-0.5">
                      Invite friends to unlock rewards
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="group w-9 h-9 bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:from-slate-700/80 hover:to-slate-800/80 rounded-xl flex items-center justify-center transition-all border border-slate-700/50 hover:border-slate-600/50 shadow-lg"
                >
                  <X className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Current Progress Summary */}
              <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-200 font-medium">
                    Total Invites
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                    {inviteCount}
                  </span>
                </div>
                <div className="text-xs text-purple-300/70">
                  Keep inviting friends to unlock more rewards!
                </div>
              </div>

              {/* Achievements List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {ACHIEVEMENTS.map((achievement) => {
                  const { isCompleted, progress } =
                    getAchievementStatus(achievement);

                  return (
                    <div
                      key={achievement.id}
                      className={`relative rounded-xl border-2 p-4 transition-all ${
                        isCompleted
                          ? "bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 border-emerald-500/40"
                          : "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={`text-3xl flex-shrink-0 ${
                            isCompleted ? "" : "opacity-50"
                          }`}
                        >
                          {achievement.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3
                              className={`font-bold text-sm ${
                                isCompleted
                                  ? "text-emerald-300"
                                  : "text-slate-300"
                              }`}
                            >
                              {achievement.title}
                            </h3>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            )}
                          </div>

                          <p
                            className={`text-xs mb-2 ${
                              isCompleted
                                ? "text-emerald-400/70"
                                : "text-slate-400"
                            }`}
                          >
                            {achievement.description}
                          </p>

                          {/* Progress Bar */}
                          {!isCompleted && (
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <span>
                                  {inviteCount} / {achievement.requiredInvites}
                                </span>
                                <span>{Math.floor(progress)}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Reward */}
                          <div className="flex items-center gap-2">
                            <img
                              src="/stone.svg"
                              alt="Stone"
                              className="w-4 h-4"
                            />
                            <span
                              className={`text-sm font-bold ${
                                isCompleted
                                  ? "text-emerald-300"
                                  : "text-amber-400"
                              }`}
                            >
                              {achievement.stoneReward} Stone
                            </span>
                            {isCompleted && (
                              <span className="text-xs text-emerald-400 ml-auto">
                                ✓ Claimed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
