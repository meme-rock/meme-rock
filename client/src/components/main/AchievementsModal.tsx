import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Award, ChevronRight } from "lucide-react";
import { useSelector, shallowEqual } from "react-redux";
import { useState, useMemo } from "react";
import { RootState } from "../../redux/store";
import { useClaimAchievementMutation } from "../../redux/services/user/user-api";

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

  // Extract required count from ID (e.g., "Invite-5" -> 5)
  const getRequiredCount = (id: string): number => {
    const match = id.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Get achievement type from ID
  const getAchievementType = (id: string): "invite" | "ad" => {
    return id.startsWith("Invite") ? "invite" : "ad";
  };

  // Get current progress
  const getCurrentProgress = (id: string) => {
    const type = getAchievementType(id);
    return type === "invite" ? inviteCount : adsWatched;
  };

  // Filter and separate achievements
  const { availableAchievements, claimedAchievements } = useMemo(() => {
    let filtered = allAchievements;

    // Filter by type
    if (filterType === "invite") {
      filtered = allAchievements.filter(
        (a) => getAchievementType(a.id) === "invite"
      );
    } else if (filterType === "ad") {
      filtered = allAchievements.filter(
        (a) => getAchievementType(a.id) === "ad"
      );
    }

    // Separate claimed and available
    const claimed = filtered.filter((a) => a.is_claimed);
    const available = filtered.filter((a) => !a.is_claimed);

    return { availableAchievements: available, claimedAchievements: claimed };
  }, [allAchievements, filterType]);

  // Get displayed achievements based on view type
  const displayedAchievements =
    viewType === "available" ? availableAchievements : claimedAchievements;

  // Handle claim action
  const handleClaim = async (achievementId: string) => {
    if (!userId || claimingId) return;

    try {
      setClaimingId(achievementId);
      await claimAchievement({
        user_id: userId,
        achievement_id: achievementId,
      }).unwrap();

      console.log("Achievement claimed successfully:", achievementId);
    } catch (error: any) {
      console.error("Failed to claim achievement:", error);
      alert(error?.data?.message || "Failed to claim achievement");
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
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 pb-20 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-purple-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content */}
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                      Achievements
                    </h2>
                    <p className="text-purple-300/70 text-xs font-medium mt-0.5">
                      Complete tasks and earn rewards
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="group w-10 h-10 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl flex items-center justify-center transition-all border border-slate-700/50"
                >
                  <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="px-6 py-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-slate-800/50">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Total</p>
                    <p className="text-xl font-bold text-white">
                      {allAchievements.length}
                    </p>
                  </div>
                  <div className="text-center border-x border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-1">Claimed</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {claimedAchievements.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Available</p>
                    <p className="text-xl font-bold text-amber-400">
                      {availableAchievements.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* View Type Tabs */}
              <div className="px-6 pt-4 flex gap-2">
                <button
                  onClick={() => setViewType("available")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all relative ${
                    viewType === "available"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-slate-800/30 text-slate-400 hover:bg-slate-800/50"
                  }`}
                >
                  Available
                  {availableAchievements.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {availableAchievements.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setViewType("claimed")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all relative ${
                    viewType === "claimed"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-slate-800/30 text-slate-400 hover:bg-slate-800/50"
                  }`}
                >
                  <Award className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                  My Badges
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="px-6 pt-3 pb-4 flex gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`flex-1 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                    filterType === "all"
                      ? "bg-slate-700 text-white"
                      : "bg-slate-800/30 text-slate-500 hover:bg-slate-800/50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("invite")}
                  className={`flex-1 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                    filterType === "invite"
                      ? "bg-slate-700 text-white"
                      : "bg-slate-800/30 text-slate-500 hover:bg-slate-800/50"
                  }`}
                >
                  Invites
                </button>
                <button
                  onClick={() => setFilterType("ad")}
                  className={`flex-1 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                    filterType === "ad"
                      ? "bg-slate-700 text-white"
                      : "bg-slate-800/30 text-slate-500 hover:bg-slate-800/50"
                  }`}
                >
                  Ads
                </button>
              </div>

              {/* Achievements List */}
              <div className="px-6 pb-6 max-h-[500px] overflow-y-auto">
                <div className="space-y-3">
                  {displayedAchievements.map((achievement) => {
                    const requiredCount = getRequiredCount(achievement.id);
                    const currentProgress = getCurrentProgress(achievement.id);
                    const progressPercentage = Math.min(
                      (currentProgress / requiredCount) * 100,
                      100
                    );
                    const isCompleted = currentProgress >= requiredCount;

                    return (
                      <motion.div
                        key={achievement.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                          achievement.is_claimed
                            ? "bg-gradient-to-r from-emerald-900/30 to-green-900/30 border-emerald-500/40"
                            : isCompleted
                            ? "bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-500/40"
                            : "bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/40"
                        }`}
                      >
                        {/* Progress Bar Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                          <div
                            className={`h-full transition-all duration-500 ${
                              achievement.is_claimed
                                ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20"
                                : "bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>

                        {/* Content */}
                        <div className="relative p-4">
                          {/* Header with Title and Badge */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <h3
                                className={`font-bold text-base ${
                                  achievement.is_claimed
                                    ? "text-emerald-300"
                                    : isCompleted
                                    ? "text-amber-300"
                                    : "text-slate-300"
                                }`}
                              >
                                {achievement.title}
                              </h3>
                              {achievement.is_claimed && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-bold text-emerald-300">
                                  CLAIMED
                                </span>
                              )}
                            </div>

                            {/* Right Icon */}
                            {achievement.is_claimed ? (
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                                <Award className="w-5 h-5 text-emerald-400" />
                              </div>
                            ) : (
                              !isCompleted && (
                                <div className="w-10 h-10 rounded-xl bg-slate-700/30 border-2 border-slate-600/30 flex items-center justify-center flex-shrink-0">
                                  <Trophy className="w-5 h-5 text-slate-500" />
                                </div>
                              )
                            )}
                          </div>

                          {/* Description */}
                          <p
                            className={`text-sm mb-3 ${
                              achievement.is_claimed
                                ? "text-emerald-400/70"
                                : "text-slate-400"
                            }`}
                          >
                            {achievement.description}
                          </p>

                          {/* Progress Info */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  achievement.is_claimed
                                    ? "text-emerald-300"
                                    : isCompleted
                                    ? "text-amber-300"
                                    : "text-slate-400"
                                }`}
                              >
                                {Math.min(currentProgress, requiredCount)} /{" "}
                                {requiredCount}
                              </span>
                              <div className="h-1.5 w-24 bg-slate-900/50 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    achievement.is_claimed
                                      ? "bg-gradient-to-r from-emerald-400 to-green-400"
                                      : isCompleted
                                      ? "bg-gradient-to-r from-amber-400 to-orange-400"
                                      : "bg-gradient-to-r from-slate-500 to-slate-600"
                                  }`}
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <img
                                src="/stone.svg"
                                alt="Stone"
                                className="w-4 h-4"
                              />
                              <span
                                className={`text-sm font-bold ${
                                  achievement.is_claimed
                                    ? "text-emerald-300"
                                    : "text-amber-400"
                                }`}
                              >
                                +{achievement.stone_reward}
                              </span>
                            </div>
                          </div>

                          {/* Claim Button - Bottom */}
                          {!achievement.is_claimed && isCompleted && (
                            <button
                              onClick={() => handleClaim(achievement.id)}
                              disabled={claimingId === achievement.id}
                              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 active:from-emerald-600 active:to-green-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-none shadow-lg flex items-center justify-center gap-2"
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
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Empty State */}
                {displayedAchievements.length === 0 && (
                  <div className="text-center py-16">
                    {viewType === "claimed" ? (
                      <>
                        <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-base font-medium mb-2">
                          No claimed achievements yet
                        </p>
                        <p className="text-slate-500 text-sm">
                          Complete tasks to earn badges
                        </p>
                      </>
                    ) : (
                      <>
                        <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-base font-medium mb-2">
                          All achievements claimed!
                        </p>
                        <p className="text-slate-500 text-sm">Great job! 🎉</p>
                      </>
                    )}
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
