import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Check, Gift, Crown, Clock } from "lucide-react";
import { useMemo } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { useCountdown } from "../../hooks/useCountdown";
import {
  getNextResetTime,
  isClaimedToday,
  isStreakBroken,
} from "../../utils/timeUtils";
import { useClaimDailyRewardMutation } from "../../redux/services/daily-reward/daily-reward-api";
import WebApp from "@twa-dev/sdk";
import { formatInteger } from "../../utils/formatNumber";

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  onClaimReward: (day: number) => void;
}

export const DailyRewardModal = ({
  isOpen,
  onClose,
  currentDay,
  onClaimReward,
}: DailyRewardModalProps) => {
  const [claimDailyReward] = useClaimDailyRewardMutation();
  const isPremium = useSelector(
    (state: RootState) => state.user.is_premium,
    shallowEqual
  );

  const userDust = useSelector(
    (state: RootState) => state.user.balance_data.dust,
    shallowEqual
  );

  const user_id = useSelector(
    (state: RootState) => state.user._id,
    shallowEqual
  );

  const current_miner = useSelector(
    (state: RootState) => state.miner.current_miner
  );
  const minerLevel = parseInt(current_miner._id.split("_")[1]);

  const dailyRewardData = useSelector(
    (state: RootState) => state.user.daily_reward_data,
    shallowEqual
  );

  const dailyRewardsList = useSelector(
    (state: RootState) => state.dailyReward.dailyReward,
    shallowEqual
  );

  // Sayaç Mantığı
  const nextResetTime = useMemo(() => getNextResetTime(), []);
  const { formattedTime } = useCountdown(nextResetTime);

  const isTodayClaimed = isClaimedToday(dailyRewardData.last_claim_date);
  const isBroken = isStreakBroken(dailyRewardData.last_claim_date);

  let effectiveDay = 1;
  const hasClaimedBefore = !!dailyRewardData.last_claim_date;

  if (!hasClaimedBefore || isBroken) {
    effectiveDay = 1;
  } else {
    effectiveDay = currentDay + 1;
    if (effectiveDay > 10) effectiveDay = 1;
  }

  const selectedDay = effectiveDay;
  const selectedRewardData = dailyRewardsList.find(
    (r) => r.day === selectedDay
  );

  const isSelectedDayAvailable = selectedDay === effectiveDay;
  const dustCost = selectedRewardData?.dust_price || 0;
  const hasEnoughDust = userDust >= dustCost;

  const handleClaimReward = async () => {
    if (isSelectedDayAvailable && !isTodayClaimed) {
      onClaimReward(selectedDay);
      const response = await claimDailyReward({ user_id }).unwrap();
      if (!response) {
        WebApp.showAlert("Failed to claim daily reward");
      }
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
          // Z-INDEX DÜZELTMESİ: z-[100] Navbar'ın (z-50) üzerine çıkarır.
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* MODAL KAPSAYICI */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }} // Hafif Animasyon
            className="bg-slate-950/90 border border-slate-800 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Sabit) */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                  <Gift className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    Daily Rewards
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Streak:{" "}
                    <span className="text-amber-400 font-bold">
                      {effectiveDay > 1 ? effectiveDay - 1 : 0} Days
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

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Progress Bar */}
              <div className="mb-6 bg-slate-900 rounded-xl p-3 border border-slate-800">
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-slate-400">Current Streak</span>
                  <span className="text-amber-400">
                    {Math.min(effectiveDay, 10)}/10
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                  {/* Background Track Pattern */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10" />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(Math.min(effectiveDay, 10) / 10) * 100}%`,
                    }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full relative"
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[2px]" />
                  </motion.div>
                </div>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-5 gap-2.5 mb-6">
                {dailyRewardsList.map((reward) => {
                  const dayNum = reward.day;
                  const isClaimed = dayNum < effectiveDay;
                  const isAvailable = dayNum === effectiveDay;
                  const isLocked = dayNum > effectiveDay;

                  return (
                    <div
                      key={dayNum}
                      className={`relative aspect-[0.85] rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border ${
                        isAvailable
                          ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.15)] scale-105 z-10"
                          : isClaimed
                          ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
                          : "bg-slate-900 border-slate-800 opacity-50"
                      }`}
                    >
                      <span
                        className={`text-[9px] font-bold uppercase ${
                          isAvailable ? "text-amber-400" : "text-slate-500"
                        }`}
                      >
                        Day {dayNum}
                      </span>

                      {/* Reward Amount */}
                      <div className="flex flex-col items-center">
                        <img
                          src="/stone.svg"
                          alt="Stone"
                          className={`w-6 h-6 object-contain ${
                            isAvailable
                              ? "brightness-110 drop-shadow-sm"
                              : "grayscale"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold mt-0.5 ${
                            isClaimed
                              ? "text-emerald-400"
                              : isAvailable
                              ? "text-white"
                              : "text-slate-500"
                          }`}
                        >
                          {formatInteger(reward.reward * minerLevel)}
                        </span>
                      </div>

                      {/* Status Icons */}
                      {isClaimed && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-[1px]">
                          <Check className="w-5 h-5 text-emerald-500 font-bold" />
                        </div>
                      )}
                      {isLocked && (
                        <div className="absolute top-1 right-1">
                          <Lock className="w-2.5 h-2.5 text-slate-700" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Area (Bottom) */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
                {isTodayClaimed ? (
                  // DURUM 2: Bugün Alındı -> Sayaç Göster
                  <div className="py-2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Clock className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Next reward in</p>
                        <p className="text-2xl font-mono font-bold text-white tracking-widest">
                          {formattedTime}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // DURUM 1: Claim Edilebilir
                  <>
                    <div className="mb-4">
                      <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-bold">
                        Today's Reward
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src="/stone.svg"
                          alt="Stone"
                          className="w-10 h-10 drop-shadow-lg"
                        />
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                          {formatInteger(
                            selectedRewardData?.reward! * minerLevel || 0
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleClaimReward}
                        disabled={!isPremium && !hasEnoughDust}
                        className={`w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden group ${
                          !isPremium && !hasEnoughDust
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                            : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                        }`}
                      >
                        {isPremium ? (
                          <>
                            <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span>Claim Reward Free</span>
                          </>
                        ) : (
                          <>
                            <span>Claim for</span>
                            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-lg border border-white/10">
                              <img
                                src="/dust.svg"
                                alt="Dust"
                                className="w-4 h-4"
                              />
                              <span>{dustCost}</span>
                            </div>
                          </>
                        )}
                      </button>

                      {!isPremium && !hasEnoughDust && (
                        <div className="text-center space-y-1">
                          <p className="text-red-400 text-xs flex items-center justify-center gap-1">
                            <X className="w-3 h-3" />
                            Insufficient Dust ({dustCost - userDust} needed)
                          </p>
                          <p className="text-amber-500/80 text-xs cursor-pointer hover:underline">
                            Watch ads to earn dust
                          </p>
                          <p className="text-yellow-300 text-xs cursor-pointer hover:underline">
                            Premium members claim for free
                          </p>
                        </div>
                      )}

                      {!isPremium && hasEnoughDust && (
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 opacity-60">
                          <Crown className="w-3 h-3" />
                          <span>Premium members claim for free</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
