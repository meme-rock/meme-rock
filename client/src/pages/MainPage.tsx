import { useMemo, useState } from "react";
import { RockCounter } from "../components/rock/RockCounter";
import { DailyRewardModal } from "../components/main/DailyRewardModal";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { motion } from "framer-motion";
import { User, Gift, Zap, Award, Calendar } from "lucide-react";

export const MainPage = () => {
  const miner_data = useSelector((state: RootState) => state.miner);
  const user = useSelector((state: RootState) => state.user);
  const hilti_data = useSelector((state: RootState) => state.hilti);

  const currentUserMinerLevel = useMemo(
    () => parseInt(miner_data.current_miner._id.split("_")[1]),
    [miner_data.current_miner._id]
  );

  const currentUserHiltiLevel = useMemo(
    () => parseInt(hilti_data.current_hilti._id.split("_")[1]),
    [hilti_data.current_hilti._id]
  );

  const dailyStreak = 7;
  const [showDailyRewardModal, setShowDailyRewardModal] = useState(false);
  const currentRewardDay = 7;

  const handleClaimReward = (day: number) => {
    console.log(`Claiming reward for day ${day}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black relative overflow-hidden pb-24">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pt-6 pb-4 max-w-lg">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4 shadow-2xl">
            {/* User Info Row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-60" />
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-blue-400/50 bg-slate-800">
                    {user.telegram_data?.photo_url ? (
                      <img
                        src={user.telegram_data.photo_url}
                        alt={user.telegram_data.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-600">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full" />
                </div>

                {/* Name and Streak */}
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">
                    {user.telegram_data?.username || "Guest"}
                  </h2>
                  <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20 w-fit">
                    <Calendar className="w-3 h-3 text-orange-400" />
                    <span className="text-xs font-semibold text-orange-300">
                      {dailyStreak} Day Streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Level Badges - Compact in top right */}
              <div className="flex flex-col gap-1">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg px-2 py-1 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-300/70">
                    Lv {currentUserMinerLevel}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg px-2 py-1 flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-300/70">
                    Lv {currentUserHiltiLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Reward Button */}
            <button
              onClick={() => setShowDailyRewardModal(true)}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 hover:border-yellow-400/60 rounded-xl p-2 transition-all hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Gift className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-yellow-300/70">Reward</span>
              </div>
              <div className="text-xl font-bold text-yellow-300">
                Day {currentRewardDay}
              </div>
            </button>
          </div>
        </motion.div>

        {/* Rock Counter - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <RockCounter />
        </motion.div>
      </div>

      {/* Daily Reward Modal */}
      <DailyRewardModal
        isOpen={showDailyRewardModal}
        onClose={() => setShowDailyRewardModal(false)}
        currentDay={currentRewardDay}
        onClaimReward={handleClaimReward}
      />
    </div>
  );
};
