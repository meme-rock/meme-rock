import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Check, Gift, Crown, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { useCountdown } from "../../hooks/useCountdown";

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  onClaimReward: (day: number) => void;
}

interface RewardDay {
  day: number;
  stoneReward: number;
  dustCost: number;
  isClaimed: boolean;
  isAvailable: boolean;
}

export const DailyRewardModal = ({
  isOpen,
  onClose,
  currentDay,
  onClaimReward,
}: DailyRewardModalProps) => {
  const [selectedDay, setSelectedDay] = useState(currentDay);

  // Get user data from Redux
  const isPremium = useSelector(
    (state: RootState) => state.user.is_premium,
    shallowEqual
  );
  const userDust = useSelector(
    (state: RootState) => state.user.balance_data.dust,
    shallowEqual
  );
  const currentMinerLevel = useSelector(
    (state: RootState) => state.miner.current_miner._id,
    shallowEqual
  );

  const minerLevel = useMemo(
    () => parseInt(currentMinerLevel.split("_")[1]),
    [currentMinerLevel]
  );

  // Calculate next reset time (Next Midnight UTC)
  const nextResetTime = useMemo(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setUTCHours(24, 0, 0, 0);
    return nextMidnight.toISOString();
  }, []);

  const { formattedTime } = useCountdown(nextResetTime);

  const rewardDays: RewardDay[] = useMemo(
    () => [
      {
        day: 1,
        stoneReward: 5 * minerLevel,
        dustCost: 50,
        isClaimed: true,
        isAvailable: true,
      },
      {
        day: 2,
        stoneReward: 10 * minerLevel,
        dustCost: 55,
        isClaimed: true,
        isAvailable: true,
      },
      {
        day: 3,
        stoneReward: 15 * minerLevel,
        dustCost: 60,
        isClaimed: true,
        isAvailable: true,
      },
      {
        day: 4,
        stoneReward: 20 * minerLevel,
        dustCost: 65,
        isClaimed: true,
        isAvailable: true,
      },
      {
        day: 5,
        stoneReward: 25 * minerLevel,
        dustCost: 70,
        isClaimed: true,
        isAvailable: true,
      },
      {
        day: 6,
        stoneReward: 30 * minerLevel,
        dustCost: 75,
        isClaimed: true,
        isAvailable: true,
      },
      {
        day: 7,
        stoneReward: 35 * minerLevel,
        dustCost: 80,
        isClaimed: false,
        isAvailable: true,
      },
      {
        day: 8,
        stoneReward: 40 * minerLevel,
        dustCost: 85,
        isClaimed: false,
        isAvailable: false,
      },
      {
        day: 9,
        stoneReward: 45 * minerLevel,
        dustCost: 90,
        isClaimed: false,
        isAvailable: false,
      },
      {
        day: 10,
        stoneReward: 50 * minerLevel,
        dustCost: 100,
        isClaimed: false,
        isAvailable: false,
      },
    ],
    [minerLevel]
  );

  const currentSelectedReward = rewardDays[selectedDay - 1];
  const hasEnoughDust = userDust >= currentSelectedReward?.dustCost;

  const handleClaimReward = () => {
    if (
      currentSelectedReward?.isAvailable &&
      !currentSelectedReward?.isClaimed
    ) {
      onClaimReward(selectedDay);
      onClose();
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
                  <span className="text-amber-400">{currentDay}/10 Days</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentDay / 10) * 100}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 gap-3 mb-8">
                {rewardDays.map((day) => {
                  const isClaimed = day.isClaimed;
                  const isAvailable = day.isAvailable;
                  const isSelected = selectedDay === day.day;
                  const isCurrent = day.day === currentDay;

                  return (
                    <button
                      key={day.day}
                      onClick={() => isAvailable && setSelectedDay(day.day)}
                      disabled={!isAvailable}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-amber-500 bg-amber-500/10"
                          : "bg-slate-800/50"
                      } ${!isAvailable && "opacity-50 cursor-not-allowed"} ${
                        isCurrent && !isClaimed ? "bg-amber-500/20" : ""
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold ${
                          isSelected ? "text-amber-400" : "text-slate-500"
                        }`}
                      >
                        Day {day.day}
                      </span>

                      {/* Always show reward amount */}
                      <div className="flex flex-col items-center">
                        <img
                          src="/stone.svg"
                          alt="Stone"
                          className={`w-5 h-5 ${
                            !isAvailable || isClaimed ? "opacity-50" : ""
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold ${
                            isClaimed
                              ? "text-green-500"
                              : !isAvailable
                              ? "text-slate-500"
                              : "text-white"
                          }`}
                        >
                          {day.stoneReward}
                        </span>
                      </div>

                      {/* Status Indicators */}
                      {isClaimed && (
                        <div className="absolute top-1 right-1 bg-green-500/20 p-0.5 rounded-full">
                          <Check className="w-3 h-3 text-green-500" />
                        </div>
                      )}
                      {!isAvailable && !isClaimed && (
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
                      {currentSelectedReward?.stoneReward}
                    </span>
                  </div>
                </div>

                {currentSelectedReward?.isAvailable &&
                !currentSelectedReward?.isClaimed ? (
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
                            <span>{currentSelectedReward?.dustCost}</span>
                          </div>
                        </>
                      )}
                    </button>

                    {!isPremium && !hasEnoughDust && (
                      <p className="text-red-400 text-xs">
                        Insufficient Dust (
                        {currentSelectedReward?.dustCost - userDust} needed)
                      </p>
                    )}

                    {!isPremium && (
                      <div className="flex items-center justify-center gap-2 text-xs text-purple-400">
                        <Crown className="w-3 h-3" />
                        <span>Premium members claim for free</span>
                      </div>
                    )}
                  </div>
                ) : currentSelectedReward?.isClaimed ? (
                  <div className="py-3.5 rounded-xl bg-green-500/10 text-green-500 font-bold flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Claimed
                  </div>
                ) : (
                  <div className="py-3.5 rounded-xl bg-slate-800 text-slate-500 font-bold flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    Locked
                  </div>
                )}
              </div>

              {/* Reset Timer Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-slate-500">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">
                  Next reward in:{" "}
                  <span className="text-slate-300 font-mono">
                    {formattedTime}
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
