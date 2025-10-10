import { motion } from "framer-motion";
import { Lock, TrendingUp, ChevronRight } from "lucide-react";
import { useState } from "react";

export interface Booster {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  isLocked: boolean;
  unlockCost: number;
  upgradeCost: number;
  baseEarnings: number;
  currentEarnings: number;
  nextLevelEarnings: number;
}

interface BoosterCardProps {
  booster: Booster;
  userStones: number;
  onUnlock: (boosterId: string) => void;
  onUpgrade: (boosterId: string) => void;
}

export const BoosterCard = ({
  booster,
  userStones,
  onUnlock,
  onUpgrade,
}: BoosterCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const canAfford = booster.isLocked
    ? userStones >= booster.unlockCost
    : userStones >= booster.upgradeCost;

  const canUpgrade = booster.level < booster.maxLevel;

  const handleAction = () => {
    if (booster.isLocked) {
      if (canAfford) onUnlock(booster.id);
    } else if (canUpgrade) {
      if (canAfford) onUpgrade(booster.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all duration-300 ${
        booster.isLocked
          ? "bg-gray-900/30 border-gray-800"
          : "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700"
      }`}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
              booster.isLocked
                ? "bg-gray-800 opacity-50"
                : "bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-600/30"
            }`}
          >
            {booster.isLocked ? (
              <Lock className="w-8 h-8 text-gray-600" />
            ) : (
              booster.icon
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-bold text-lg ${
                  booster.isLocked ? "text-gray-500" : "text-white"
                }`}
              >
                {booster.name}
              </h3>
              {!booster.isLocked && (
                <span className="text-xs bg-cyan-600/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-600/30">
                  Lv.{booster.level}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-2">{booster.description}</p>

            {/* Earnings display */}
            {!booster.isLocked && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-yellow-400">
                  +{booster.currentEarnings} $ROCK/h
                </span>
              </div>
            )}
          </div>

          {/* Expand indicator */}
          <ChevronRight
            className={`w-5 h-5 text-gray-400 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-800 p-4"
        >
          {booster.isLocked ? (
            <>
              {/* Unlock info */}
              <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400 mb-2">Unlock to earn</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-lg font-bold text-yellow-400">
                    +{booster.baseEarnings} $ROCK/h
                  </span>
                </div>
              </div>

              {/* Unlock button */}
              <button
                onClick={handleAction}
                disabled={!canAfford}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  canAfford
                    ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <img src="/stone.svg" alt="Stone" className="w-5 h-5" />
                  <span>
                    Unlock for {booster.unlockCost.toLocaleString()} Stones
                  </span>
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Upgrade info */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Current</p>
                  <p className="text-lg font-bold text-white">
                    +{booster.currentEarnings}/h
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Next Level</p>
                  <p className="text-lg font-bold text-green-400">
                    {canUpgrade ? `+${booster.nextLevelEarnings}/h` : "MAX"}
                  </p>
                </div>
              </div>

              {/* Level progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                  <span>Level {booster.level}</span>
                  <span>
                    {booster.level}/{booster.maxLevel}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-500 transition-all"
                    style={{
                      width: `${(booster.level / booster.maxLevel) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Upgrade button */}
              {canUpgrade && (
                <button
                  onClick={handleAction}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    canAfford
                      ? "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <img src="/stone.svg" alt="Stone" className="w-5 h-5" />
                    <span>
                      Upgrade for {booster.upgradeCost.toLocaleString()} Stones
                    </span>
                  </div>
                </button>
              )}

              {!canUpgrade && (
                <div className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-center">
                  MAX LEVEL
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
