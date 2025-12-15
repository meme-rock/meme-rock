import { useMemo, useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";
import { motion, AnimatePresence } from "framer-motion";
import { Tv, X } from "lucide-react";
import { CgArrowsExchange } from "react-icons/cg";

// Components
import { RockCounter } from "../components/main/RockCounter";
import { ProfileCard } from "../components/main/ProfileCard"; // YENİ COMPONENT
import { DailyRewardModal } from "../components/main/DailyRewardModal";
import { AchievementsModal } from "../components/main/AchievementsModal";
import { PremiumModal } from "../components/premium/PremiumModal";
import { StoneTodustExchange } from "../components/main/exchange/Exchange";
import { AdRewardSection } from "../components/main/ads/AdRewardSection";

export const MainPage = () => {
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
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showAdRewardModal, setShowAdRewardModal] = useState(false);

  const currentRewardDay = user.daily_reward_data.day;

  const handleClaimReward = (day: number) => {
    console.log(`Claiming reward for day ${day}`);
  };

  return (
    // TopBar için pt-20 boşluğu bıraktık
    <div className="min-h-screen bg-slate-950 pt-3 pb-24 relative overflow-hidden">
      {/* Background Gradients (Sabit ve hafif) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-cyan-900/10 blur-[100px]" />
      </div>

      <div className="relative container mx-auto px-4 max-w-lg space-y-4">
        {/* 1. YENİ PROFILE CARD */}
        <ProfileCard
          telegramData={telegramData}
          isPremium={user.is_premium}
          minerLevel={currentUserMinerLevel}
          hiltiLevel={currentUserHiltiLevel}
          rewardDay={currentRewardDay}
          onOpenDailyReward={() => setShowDailyRewardModal(true)}
          onOpenAchievements={() => setShowAchievementsModal(true)}
          onOpenPremium={() => setShowPremiumModal(true)}
        />

        {/* 2. ROCK COUNTER */}
        <RockCounter />

        {/* 3. ALT BUTONLAR (Exchange & Ads) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Exchange Button */}
          <button
            onClick={() => setShowExchangeModal(true)}
            className="group relative overflow-hidden bg-slate-900/60 border border-slate-700/50 hover:border-cyan-500/30 rounded-2xl p-4 transition-all active:scale-95"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <CgArrowsExchange className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-white">
                Exchange
              </span>
            </div>
          </button>

          {/* Watch Ads Button */}
          <button
            onClick={() => setShowAdRewardModal(true)}
            className="group relative overflow-hidden bg-slate-900/60 border border-slate-700/50 hover:border-purple-500/30 rounded-2xl p-4 transition-all active:scale-95"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Tv className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-bold text-slate-300 group-hover:text-white">
                Watch Ads
              </span>
            </div>
          </button>
        </motion.div>
      </div>

      {/* --- MODALS --- */}

      <DailyRewardModal
        isOpen={showDailyRewardModal}
        onClose={() => setShowDailyRewardModal(false)}
        currentDay={currentRewardDay}
        onClaimReward={handleClaimReward}
      />

      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />

      <PremiumModal
        user_id={user._id}
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        premiumStarPrice={premiumMarketItem?.stars_price || 500}
        premiumTonPrice={premiumMarketItem?.ton_price || 0.5}
      />

      {/* Exchange Modal Wrapper */}
      <AnimatePresence>
        {showExchangeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowExchangeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button inside modal for better UX */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowExchangeModal(false)}
                  className="p-2 bg-black/20 rounded-full hover:bg-black/40"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <StoneTodustExchange />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Reward Modal Wrapper */}
      <AnimatePresence>
        {showAdRewardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowAdRewardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden p-1" // p-1 for border padding if needed
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowAdRewardModal(false)}
                  className="p-2 bg-black/20 rounded-full hover:bg-black/40"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <AdRewardSection />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
