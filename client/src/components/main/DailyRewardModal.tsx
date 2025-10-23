import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  Star,
  Gift,
  Zap,
  Crown,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";

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
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 pb-20 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/30 rounded-3xl w-full max-w-md shadow-xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent">
                      Daily Rewards
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <p className="text-amber-300/70 text-xs font-medium">
                        Day {currentDay} of 10
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="group w-9 h-9 bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:from-slate-700/80 hover:to-slate-800/80 rounded-xl flex items-center justify-center transition-all border border-slate-700/50 hover:border-slate-600/50 shadow-lg"
                >
                  <X className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Info Banners */}
              <div className="space-y-2 mb-4">
                {/* Miner Level Info */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-2.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <p className="text-blue-200/80 text-xs font-medium">
                    Level up your miner for bigger rewards!
                  </p>
                </div>

                {/* Streak Warning */}
                <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-2.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <p className="text-orange-200/80 text-xs font-medium">
                    Claim within 48 hours to keep your streak!
                  </p>
                </div>

                {/* Premium Badge */}
                {isPremium && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/40 rounded-lg p-2.5 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <p className="text-purple-200/90 text-xs font-medium">
                      Premium Active - No dust cost & no ads!
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    Progress
                  </span>
                  <span className="text-xs text-amber-400 font-bold">
                    {currentDay}/10
                  </span>
                </div>
                <div className="relative h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentDay / 10) * 100}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 relative shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse" />
                    <motion.div
                      animate={{ x: [0, 100, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-20"
                    />
                  </motion.div>
                </div>
              </div>

              {/* Rewards Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {rewardDays.map((day) => {
                  const isClaimed = day.isClaimed;
                  const isAvailable = day.isAvailable;
                  const isSelected = selectedDay === day.day;

                  return (
                    <button
                      key={day.day}
                      onClick={() => isAvailable && setSelectedDay(day.day)}
                      disabled={!isAvailable}
                      className={`relative aspect-square rounded-xl transition-all duration-300 ${
                        isClaimed
                          ? "bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20"
                          : isAvailable
                          ? "bg-gradient-to-br from-amber-900/40 to-orange-950/40 border-2 border-amber-500/60 hover:border-amber-400 hover:scale-110 hover:shadow-xl hover:shadow-amber-500/30 cursor-pointer"
                          : "bg-slate-900/50 border-2 border-slate-700/30 opacity-40"
                      } ${
                        isSelected && isAvailable
                          ? "ring-2 ring-amber-400 scale-110 shadow-xl shadow-amber-500/40"
                          : ""
                      }`}
                    >
                      {/* Day number */}
                      <div className="absolute top-1 left-1 text-[10px] font-bold text-slate-400">
                        {day.day}
                      </div>

                      {/* Center content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {isClaimed ? (
                          <div className="relative">
                            {/* Show reward amount */}
                            <img
                              src="/stone.svg"
                              alt="Stone"
                              className="w-6 h-6 mb-1 opacity-70"
                            />
                            <span className="text-xs font-bold text-emerald-300">
                              {day.stoneReward}
                            </span>
                            {/* Green checkmark badge */}
                            <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                        ) : !isAvailable ? (
                          <Lock className="w-4 h-4 text-slate-600" />
                        ) : (
                          <>
                            <img
                              src="/stone.svg"
                              alt="Stone"
                              className="w-6 h-6 mb-1"
                            />
                            <span className="text-xs font-bold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
                              {day.stoneReward}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Glow effect only for selected */}
                      {isAvailable && !isClaimed && isSelected && (
                        <div className="absolute inset-0 bg-amber-500/20 rounded-xl" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected reward display */}
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-slate-800/70 to-slate-900/70 border-2 border-amber-500/30 rounded-2xl p-5 mb-4 overflow-hidden"
              >
                <div className="relative flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <div className="text-xs text-amber-300/70 font-medium">
                        Day {selectedDay} Reward
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src="/stone.svg" alt="Stone" className="w-8 h-8" />
                      <span className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent">
                        {currentSelectedReward?.stoneReward}
                      </span>
                    </div>
                  </div>

                  {/* Cost Display */}
                  {!isPremium && (
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-lg ${
                        hasEnoughDust
                          ? "bg-gradient-to-br from-slate-900/80 to-black/80 border-amber-500/30"
                          : "bg-gradient-to-br from-red-900/40 to-red-950/40 border-red-500/40"
                      }`}
                    >
                      <img src="/dust.svg" alt="Dust" className="w-5 h-5" />
                      <span
                        className={`text-sm font-bold ${
                          hasEnoughDust ? "text-amber-400" : "text-red-400"
                        }`}
                      >
                        {currentSelectedReward?.dustCost}
                      </span>
                    </div>
                  )}

                  {isPremium && (
                    <div className="flex items-center gap-2 bg-gradient-to-br from-purple-900/40 to-pink-900/40 px-4 py-2 rounded-xl border border-purple-500/40 shadow-lg">
                      <Crown className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-bold text-purple-300">
                        FREE
                      </span>
                    </div>
                  )}
                </div>

                {/* Claim button */}
                {currentSelectedReward?.isAvailable &&
                !currentSelectedReward?.isClaimed ? (
                  <>
                    <div>
                      <button
                        onClick={handleClaimReward}
                        disabled={!isPremium && !hasEnoughDust}
                        className={`w-full font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                          !isPremium && !hasEnoughDust
                            ? "bg-slate-800/50 border-2 border-slate-700/40 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-600 hover:from-amber-500 hover:via-orange-400 hover:to-yellow-500 text-white"
                        }`}
                      >
                        <Gift className="w-5 h-5" />
                        <span>
                          {isPremium ? "Claim Reward (FREE)" : "Claim Reward"}
                        </span>
                      </button>

                      {/* Insufficient funds warning */}
                      {!isPremium && !hasEnoughDust && (
                        <p className="text-red-400 text-xs text-center mt-2">
                          Insufficient Dust: Need{" "}
                          {currentSelectedReward?.dustCost - userDust} more
                        </p>
                      )}
                    </div>

                    {/* Premium CTA */}
                    {!isPremium && (
                      <div className="mt-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/40 rounded-lg p-3 flex items-start gap-2">
                        <Crown className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-purple-200 text-xs font-medium mb-1">
                            Get Premium
                          </p>
                          <p className="text-purple-200/70 text-xs">
                            Unlock free daily rewards & skip all ads!
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : currentSelectedReward?.isClaimed ? (
                  <div className="w-full bg-gradient-to-r from-emerald-900/40 to-emerald-950/40 border-2 border-emerald-500/40 text-emerald-400 font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                    <Star className="w-5 h-5 fill-emerald-400" />
                    Claimed
                  </div>
                ) : (
                  <div className="w-full bg-slate-800/50 border-2 border-slate-700/40 text-slate-500 font-bold py-4 rounded-xl text-center flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    Locked
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
