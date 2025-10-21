import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Star, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  onClaimReward: (day: number) => void;
}

interface RewardDay {
  day: number;
  stoneReward: number;
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

  const rewardDays: RewardDay[] = useMemo(
    () => [
      { day: 1, stoneReward: 100, isClaimed: true, isAvailable: true },
      { day: 2, stoneReward: 150, isClaimed: true, isAvailable: true },
      { day: 3, stoneReward: 200, isClaimed: true, isAvailable: true },
      { day: 4, stoneReward: 250, isClaimed: true, isAvailable: true },
      { day: 5, stoneReward: 300, isClaimed: true, isAvailable: true },
      { day: 6, stoneReward: 400, isClaimed: true, isAvailable: true },
      { day: 7, stoneReward: 500, isClaimed: false, isAvailable: true },
      { day: 8, stoneReward: 600, isClaimed: false, isAvailable: false },
      { day: 9, stoneReward: 750, isClaimed: false, isAvailable: false },
      { day: 10, stoneReward: 1000, isClaimed: false, isAvailable: false },
    ],
    []
  );

  const currentSelectedReward = rewardDays[selectedDay - 1];
  const DUST_COST = 50;

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
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-gradient-to-b from-slate-900 via-blue-950 to-black border border-blue-800/30 rounded-3xl w-full max-w-md shadow-2xl shadow-blue-500/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glowing background effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/50 rounded-xl blur-md animate-pulse" />
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Daily Rewards
                    </h2>
                    <p className="text-blue-300/70 text-xs">
                      Day {currentDay} of 10
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg flex items-center justify-center transition-all border border-slate-700/50"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentDay / 10) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>

              {/* Rewards Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {rewardDays.map((day, index) => {
                  const isClaimed = day.isClaimed;
                  const isAvailable = day.isAvailable;
                  const isSelected = selectedDay === day.day;

                  return (
                    <motion.button
                      key={day.day}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => isAvailable && setSelectedDay(day.day)}
                      disabled={!isAvailable}
                      className={`relative aspect-square rounded-xl transition-all ${
                        isClaimed
                          ? "bg-gradient-to-br from-emerald-900/40 to-emerald-950/40 border border-emerald-500/30"
                          : isAvailable
                          ? "bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-blue-500/50 hover:border-blue-400 hover:scale-105 cursor-pointer"
                          : "bg-slate-900/40 border border-slate-700/30 opacity-50"
                      } ${
                        isSelected && isAvailable
                          ? "ring-2 ring-blue-400 scale-105"
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
                          <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                        ) : !isAvailable ? (
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                        ) : (
                          <>
                            <img
                              src="/stone.svg"
                              alt="Stone"
                              className="w-4 h-4 mb-0.5"
                            />
                            <span className="text-[9px] font-bold text-blue-300">
                              {day.stoneReward}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Glow effect for available */}
                      {isAvailable && !isClaimed && (
                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-sm animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Selected reward display */}
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/20 rounded-2xl p-4 mb-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-blue-300/70 mb-1">
                      Day {selectedDay} Reward
                    </div>
                    <div className="flex items-center gap-2">
                      <img src="/stone.svg" alt="Stone" className="w-6 h-6" />
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {currentSelectedReward?.stoneReward}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                    <img src="/dust.svg" alt="Dust" className="w-4 h-4" />
                    <span className="text-xs text-yellow-400 font-semibold">
                      {DUST_COST}
                    </span>
                  </div>
                </div>

                {/* Claim button */}
                {currentSelectedReward?.isAvailable &&
                !currentSelectedReward?.isClaimed ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClaimReward}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30"
                  >
                    Claim Reward
                  </motion.button>
                ) : currentSelectedReward?.isClaimed ? (
                  <div className="w-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 font-semibold py-3 rounded-xl text-center flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 fill-emerald-400" />
                    Claimed
                  </div>
                ) : (
                  <div className="w-full bg-slate-800/30 border border-slate-700/30 text-slate-500 font-semibold py-3 rounded-xl text-center flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Locked
                  </div>
                )}
              </motion.div>

              {/* Info banner */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-3 flex items-start gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-1.5 rounded-lg mt-0.5">
                  <Star className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-0.5">
                    Level Up for More!
                  </h4>
                  <p className="text-blue-300/60 text-xs leading-relaxed">
                    Upgrade your miner to unlock bigger rewards and exclusive
                    bonuses.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
