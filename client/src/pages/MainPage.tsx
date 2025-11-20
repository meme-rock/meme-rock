import { useMemo, useState } from "react";
import { RockCounter } from "../components/rock/RockCounter";
import { DailyRewardModal } from "../components/main/DailyRewardModal";
import { AchievementsModal } from "../components/main/AchievementsModal";
import { PremiumModal } from "../components/premium/PremiumModal";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";
import { motion } from "framer-motion";
import { User, Gift, Pickaxe, Trophy, Crown } from "lucide-react";

export const MainPage = () => {
  // Select only needed fields to avoid re-renders from displayRocks updates

  const user = useSelector((state: RootState) => state.user);
  const premiumMarketItem = useSelector(
    (state: RootState) => state.user.premium_market_item
  );

  const currentMiner = useSelector(
    (state: RootState) => state.miner.current_miner,
    shallowEqual
  );
  const currentHilti = useSelector(
    (state: RootState) => state.hilti.current_hilti,
    shallowEqual
  );
  const telegramData = useSelector(
    (state: RootState) => state.user.telegram_data,
    shallowEqual
  );

  const currentUserMinerLevel = useMemo(
    () => parseInt(currentMiner._id.split("_")[1]),
    [currentMiner._id]
  );

  const currentUserHiltiLevel = useMemo(
    () => parseInt(currentHilti._id.split("_")[1]),
    [currentHilti._id]
  );

  const [showDailyRewardModal, setShowDailyRewardModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
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
                    {telegramData?.photo_url ? (
                      <img
                        src={telegramData.photo_url}
                        alt={telegramData.username}
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
                    {telegramData?.username || "Guest"}
                  </h2>
                  {user.is_premium && (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-lg px-2 py-1 w-fit">
                      <Crown className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-300">
                        Premium
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Level Badges - Compact in top right */}
              <div className="flex flex-col gap-1">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg px-2 py-1 flex items-center gap-1.5">
                  <Pickaxe className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-300/70">
                    Lv {currentUserMinerLevel}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg px-2 py-1 flex items-center gap-1.5">
                  <img
                    src="./jackhammer.svg"
                    alt="Jackhammer"
                    className="w-3 h-3 object-contain text-purple-400"
                  />
                  <span className="text-xs text-purple-300/70">
                    Lv {currentUserHiltiLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Daily Reward & Achievements */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Daily Reward Button */}
              <button
                onClick={() => setShowDailyRewardModal(true)}
                className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20 p-[2px] hover:from-amber-400/30 hover:via-orange-400/30 hover:to-yellow-400/30 transition-all duration-300 active:scale-95"
              >
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-xl p-3 group-hover:from-gray-800 group-hover:to-gray-900 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-1.5 rounded-lg">
                      <Gift className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-[10px] text-amber-300/60 font-medium">
                        Daily Reward
                      </div>
                      <div className="text-base font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent">
                        Day {currentRewardDay}
                      </div>
                    </div>
                  </div>
                  {/* Progress indicator */}
                  <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentRewardDay / 10) * 100}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  </div>
                </div>
              </button>

              {/* Achievements Button */}
              <button
                onClick={() => setShowAchievementsModal(true)}
                className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 p-[2px] hover:from-purple-400/30 hover:via-pink-400/30 hover:to-purple-400/30 transition-all duration-300 active:scale-95"
              >
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-xl p-3 group-hover:from-gray-800 group-hover:to-gray-900 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-1.5 rounded-lg">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-[10px] text-purple-300/60 font-medium">
                        Achievements
                      </div>
                      <div className="text-base font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                        Claim
                      </div>
                    </div>
                  </div>
                  {/* Decorative bar */}
                  <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />
                  </div>
                </div>
              </button>
            </div>

            {/* Get Premium Button - Only show if user is not premium */}
            {!user.is_premium && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => setShowPremiumModal(true)}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 p-[2px] hover:from-amber-400/30 hover:via-yellow-400/30 hover:to-orange-400/30 transition-all duration-300 active:scale-95"
              >
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-xl p-3 group-hover:from-gray-800 group-hover:to-gray-900 transition-all duration-300">
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-1.5 rounded-lg">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent">
                        Get Premium
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            )}
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

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />

      {/* Premium Modal */}
      <PremiumModal
        user_id={user._id}
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        premiumStarPrice={premiumMarketItem?.stars_price || 500}
        premiumTonPrice={premiumMarketItem?.ton_price || 0.5}
      />
    </div>
  );
};
