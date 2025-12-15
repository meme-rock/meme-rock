import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Award,
  CheckCircle2,
  UserPlus,
  Tv,
  ChevronRight,
} from "lucide-react";
import { useSelector, shallowEqual } from "react-redux";
import { useState, useMemo } from "react";
import { RootState } from "../../redux/store";
import { useClaimAchievementMutation } from "../../redux/services/user/user-api";
import { formatInteger } from "../../utils/formatNumber";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = "all" | "invite" | "ad";
type ViewType = "available" | "claimed";

export const AchievementsModal = ({
  isOpen,
  onClose,
}: AchievementsModalProps) => {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [viewType, setViewType] = useState<ViewType>("available");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const userId = useSelector(
    (state: RootState) => state.user._id,
    shallowEqual
  );

  const inviteCount = useSelector(
    (state: RootState) => state.user.invite_count,
    shallowEqual
  );

  const adsWatched = useSelector(
    (state: RootState) => state.user.ad_data.ads_watched_total,
    shallowEqual
  );

  const allAchievements = useSelector(
    (state: RootState) => state.achievements.allAchievements,
    shallowEqual
  );

  const [claimAchievement] = useClaimAchievementMutation();

  const getRequiredCount = (id: string): number => {
    const match = id.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const getAchievementType = (id: string): "invite" | "ad" => {
    return id.startsWith("Invite") ? "invite" : "ad";
  };

  const getCurrentProgress = (id: string) => {
    const type = getAchievementType(id);
    return type === "invite" ? inviteCount : adsWatched;
  };

  const { availableAchievements, claimedAchievements } = useMemo(() => {
    let filtered = allAchievements;

    if (filterType === "invite") {
      filtered = allAchievements.filter(
        (a) => getAchievementType(a.id) === "invite"
      );
    } else if (filterType === "ad") {
      filtered = allAchievements.filter(
        (a) => getAchievementType(a.id) === "ad"
      );
    }

    const claimed = filtered.filter((a) => a.is_claimed);
    const available = filtered.filter((a) => !a.is_claimed);

    return { availableAchievements: available, claimedAchievements: claimed };
  }, [allAchievements, filterType]);

  const displayedAchievements =
    viewType === "available" ? availableAchievements : claimedAchievements;

  const handleClaim = async (achievementId: string) => {
    if (!userId || claimingId) return;

    try {
      setClaimingId(achievementId);
      await claimAchievement({
        user_id: userId,
        achievement_id: achievementId,
      }).unwrap();
    } catch (error: any) {
      console.error("Failed to claim achievement:", error);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-slate-950 border border-slate-800 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    Achievements
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Completed:{" "}
                    <span className="text-white font-bold">
                      {claimedAchievements.length}/{allAchievements.length}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
              {/* TABS (Available / Badges) */}
              <div className="flex p-4 gap-2 sticky top-0 bg-slate-950/95 backdrop-blur-sm z-20 border-b border-white/5">
                <button
                  onClick={() => setViewType("available")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
                    viewType === "available"
                      ? "bg-slate-800 text-white shadow-lg"
                      : "text-slate-500 hover:bg-slate-900"
                  }`}
                >
                  Active Missions
                  {availableAchievements.length > 0 && (
                    <span className="ml-2 bg-amber-500 text-black text-[10px] px-1.5 py-0.5 rounded-full">
                      {availableAchievements.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setViewType("claimed")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    viewType === "claimed"
                      ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-500 hover:bg-slate-900"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Completed
                </button>
              </div>

              {/* FILTERS (All / Invite / Ads) */}
              <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                {["all", "invite", "ad"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as FilterType)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all whitespace-nowrap ${
                      filterType === type
                        ? "bg-slate-800 text-white border-slate-600"
                        : "bg-transparent text-slate-500 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {type === "all"
                      ? "All Tasks"
                      : type === "ad"
                      ? "Watch Ads"
                      : "Invites"}
                  </button>
                ))}
              </div>

              {/* LIST */}
              <div className="p-4 space-y-3 pb-20">
                {displayedAchievements.map((achievement) => {
                  const requiredCount = getRequiredCount(achievement.id);
                  const currentProgress = getCurrentProgress(achievement.id);
                  const progressPercentage = Math.min(
                    (currentProgress / requiredCount) * 100,
                    100
                  );
                  const isCompleted = currentProgress >= requiredCount;
                  const canClaim = isCompleted && !achievement.is_claimed;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      key={achievement.id}
                      className={`relative rounded-2xl border overflow-hidden transition-all ${
                        achievement.is_claimed
                          ? "bg-slate-900/40 border-slate-800 opacity-60 grayscale-[0.5]" // Alınmış: Sönük
                          : canClaim
                          ? "bg-slate-900 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]" // Alınabilir: Parlak
                          : "bg-slate-900 border-slate-800" // Normal
                      }`}
                    >
                      {/* Can Claim Glow Effect */}
                      {canClaim && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full pointer-events-none" />
                      )}

                      <div className="p-4 relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          {/* Icon & Title */}
                          <div className="flex gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                achievement.is_claimed
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                  : canClaim
                                  ? "bg-amber-500/20 border-amber-500/30 text-amber-500"
                                  : "bg-slate-800 border-slate-700 text-slate-500"
                              }`}
                            >
                              {getAchievementType(achievement.id) ===
                              "invite" ? (
                                <UserPlus className="w-5 h-5" />
                              ) : (
                                <Tv className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <h3
                                className={`text-sm font-bold ${
                                  achievement.is_claimed
                                    ? "text-emerald-400"
                                    : canClaim
                                    ? "text-white"
                                    : "text-slate-300"
                                }`}
                              >
                                {achievement.title}
                              </h3>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                {achievement.description}
                              </p>
                            </div>
                          </div>

                          {/* Reward Badge */}
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-800">
                              <img
                                src="/stone.svg"
                                alt="Stone"
                                className="w-3.5 h-3.5"
                              />
                              <span className="text-xs font-bold text-white">
                                +{formatInteger(achievement.stone_reward!)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar Area */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-medium mb-1.5">
                            <span
                              className={
                                canClaim ? "text-amber-400" : "text-slate-500"
                              }
                            >
                              {canClaim ? "Task Completed!" : "Progress"}
                            </span>
                            <span className="text-slate-400">
                              {Math.min(currentProgress, requiredCount)} /{" "}
                              {requiredCount}
                            </span>
                          </div>

                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                achievement.is_claimed
                                  ? "bg-emerald-500"
                                  : canClaim
                                  ? "bg-amber-500"
                                  : "bg-slate-600"
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Claim Button (Only if completed and not claimed) */}
                        {canClaim && (
                          <button
                            onClick={() => handleClaim(achievement.id)}
                            disabled={claimingId === achievement.id}
                            className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                          >
                            {claimingId === achievement.id ? (
                              "Claiming..."
                            ) : (
                              <>
                                Claim Reward
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        )}

                        {/* Claimed Stamp */}
                        {achievement.is_claimed && (
                          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/5 py-2 rounded-lg border border-emerald-500/10">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Reward Claimed
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Empty State */}
                {displayedAchievements.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      {viewType === "claimed" ? (
                        <Award className="w-8 h-8 text-slate-500" />
                      ) : (
                        <Trophy className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    <p className="text-slate-400 font-medium">
                      No achievements found
                    </p>
                    <p className="text-slate-600 text-xs">
                      Try changing filters
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
