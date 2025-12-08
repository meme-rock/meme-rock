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

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number; // Kullanıcının şu anki günü (örn: 3)
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

  // Redux'tan günlük ödül listesini çekiyoruz
  const dailyRewardsList = useSelector(
    (state: RootState) => state.dailyReward.dailyReward,
    shallowEqual
  );

  // Sayaç Mantığı (08:00 AM UTC)
  const nextResetTime = useMemo(() => getNextResetTime(), []);
  const { formattedTime } = useCountdown(nextResetTime);

  // Bugünün ödülü alınmış mı?
  const isTodayClaimed = isClaimedToday(dailyRewardData.last_claim_date);

  // Streak bozulmuş mu?
  const isBroken = isStreakBroken(dailyRewardData.last_claim_date);

  // Görüntülenecek gün:
  // 1. Eğer bugün ödül alındıysa -> Bir sonraki günü göster (currentDay + 1)
  // 2. Eğer streak bozulduysa (ve bugün alınmadıysa) -> 1. günü göster
  // 3. Normal durum -> currentDay
  // Görüntülenecek gün:
  // 1. Eğer hiç claim yoksa -> 1
  // 2. Eğer streak bozulduysa -> 1
  // 3. Aksi halde -> currentDay + 1 (10'dan sonra 1'e döner)
  let effectiveDay = 1;
  const hasClaimedBefore = !!dailyRewardData.last_claim_date;

  if (!hasClaimedBefore || isBroken) {
    effectiveDay = 1;
  } else {
    effectiveDay = currentDay + 1;
    if (effectiveDay > 10) effectiveDay = 1;
  }

  // Seçili gün artık her zaman effectiveDay
  const selectedDay = effectiveDay;

  // Seçili günün verisini bul
  const selectedRewardData = dailyRewardsList.find(
    (r) => r.day === selectedDay
  );

  // Seçili günün durumu
  const isSelectedDayAvailable = selectedDay === effectiveDay;

  // Bakiye kontrolü (Sadece Premium değilse kontrol et)
  const dustCost = selectedRewardData?.dust_price || 0;
  const hasEnoughDust = userDust >= dustCost;

  const handleClaimReward = async () => {
    // Sadece mevcut gün alınabilir ve kilitli/alınmış olmamalı
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div>
                <h2 className="text-2xl font-bold text-white">Daily Rewards</h2>
                <p className="text-slate-400 text-sm">
                  Come back daily to earn more!
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 pt-4">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-slate-400">Your Progress</span>
                  <span className="text-amber-400">
                    {effectiveDay > 10 ? 10 : effectiveDay}/10 Days
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(Math.min(effectiveDay, 10) / 10) * 100}%`,
                    }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 gap-3 mb-8">
                {dailyRewardsList.map((reward) => {
                  const dayNum = reward.day;
                  const isClaimed = dayNum < effectiveDay;
                  const isAvailable = dayNum === effectiveDay;
                  const isLocked = dayNum > effectiveDay;
                  const isSelected = selectedDay === dayNum;

                  return (
                    <button
                      key={dayNum}
                      // onClick={() => setSelectedDay(dayNum)} // Navigation disabled
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-amber-500 bg-amber-500/10"
                          : "bg-slate-800/50"
                      } ${isLocked ? "opacity-50" : "opacity-100"} ${
                        isAvailable ? "bg-amber-500/20" : ""
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold ${
                          isSelected ? "text-amber-400" : "text-slate-500"
                        }`}
                      >
                        Day {dayNum}
                      </span>

                      {/* Reward Amount */}
                      <div className="flex flex-col items-center">
                        <img
                          src="/stone.svg"
                          alt="Stone"
                          className={`w-5 h-5 ${
                            isLocked || isClaimed ? "opacity-50" : ""
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold ${
                            isClaimed
                              ? "text-green-500"
                              : isLocked
                              ? "text-slate-500"
                              : "text-white"
                          }`}
                        >
                          {reward.reward * minerLevel}
                        </span>
                      </div>

                      {/* Status Indicators */}
                      {isClaimed && (
                        <div className="absolute top-1 right-1 bg-green-500/20 p-0.5 rounded-full">
                          <Check className="w-3 h-3 text-green-500" />
                        </div>
                      )}
                      {isLocked && (
                        <div className="absolute top-1 right-1">
                          <Lock className="w-3 h-3 text-slate-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Area */}
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-1">
                    Day {selectedDay} Reward
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <img src="/stone.svg" alt="Stone" className="w-8 h-8" />
                    <span className="text-3xl font-black text-white">
                      {selectedRewardData?.reward! * minerLevel || 0}
                    </span>
                  </div>
                </div>

                {/* Buton Durumları */}
                {isSelectedDayAvailable && !isTodayClaimed ? (
                  // DURUM 1: Güncel Gün (Claim Edilebilir)
                  <div className="space-y-3">
                    <button
                      onClick={handleClaimReward}
                      disabled={!isPremium && !hasEnoughDust}
                      className={`w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        !isPremium && !hasEnoughDust
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                      }`}
                    >
                      {isPremium ? (
                        <>
                          <Gift className="w-5 h-5" />
                          Claim Free
                        </>
                      ) : (
                        <>
                          <span>Claim for</span>
                          <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-lg">
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
                      <div className="flex flex-col mt-1">
                        {/* Hata Mesajı */}
                        <p className="text-red-400 text-[12px]">
                          Insufficient Dust ({dustCost - userDust} needed)
                        </p>

                        {/* Bilgilendirme Mesajı (Tıklanmaz, sadece yazı) */}
                        <p className="text-yellow-500/80 text-[12px] mt-0.5">
                          Watch Ads to earn Dust
                        </p>
                      </div>
                    )}

                    {!isPremium && (
                      <div className="flex items-center justify-center gap-2 text-[12px] text-purple-400">
                        <Crown className="w-3 h-3" />
                        <span>Premium members claim for free</span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Reset Timer Footer - Sadece bugün alındıysa göster */}
              {isTodayClaimed && (
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    Next reward in:{" "}
                    <span className="text-slate-300 font-mono">
                      {formattedTime}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
