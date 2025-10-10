import { motion } from "framer-motion";
import { CheckCircle, ArrowUp } from "lucide-react";

interface UpgradeRequirementsProps {
  nextLevel: number;
  stonesSpent: number; // User'ın harcadığı stone'lar
  spent_stones_to_upgrade: number; // Bu level için gerekli stone'lar
  canUpgrade: boolean;
  onUpgrade: () => void;
}

export const UpgradeRequirements = ({
  nextLevel,
  stonesSpent,
  spent_stones_to_upgrade,
  canUpgrade,
  onUpgrade,
}: UpgradeRequirementsProps) => {
  const isCompleted = stonesSpent >= spent_stones_to_upgrade;
  const progressPercentage = Math.min(
    100,
    (stonesSpent / spent_stones_to_upgrade) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-md mx-auto mt-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          <ArrowUp className="w-5 h-5" />
          Upgrade to Level {nextLevel}
        </h3>
        {isCompleted && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
          </motion.div>
        )}
      </div>

      {/* Stones Requirement */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
            isCompleted
              ? "bg-green-900/20 border-green-700/50"
              : "bg-gray-800/50 border-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isCompleted
                  ? "bg-green-600/20 border border-green-600/30"
                  : "bg-gray-800 border border-gray-700"
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <img src="/stone.svg" alt="Stone" className="w-8 h-8" />
              )}
            </div>
            <div>
              <p
                className={`font-bold text-lg mb-1 ${
                  isCompleted ? "text-green-400" : "text-white"
                }`}
              >
                {isCompleted ? "Requirement Complete!" : "Spend Stones"}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">
                  {stonesSpent.toLocaleString()} /{" "}
                  {spent_stones_to_upgrade.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex flex-col items-end">
            <span
              className={`text-xl font-bold mb-1 ${
                isCompleted ? "text-green-400" : "text-cyan-400"
              }`}
            >
              {progressPercentage.toFixed(0)}%
            </span>
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className={`h-full ${
                  isCompleted
                    ? "bg-gradient-to-r from-green-500 to-green-400"
                    : "bg-gradient-to-r from-cyan-600 to-cyan-500"
                }`}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info text */}
      {!isCompleted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-gray-400 text-center mb-4 px-4"
        >
          Spend stones on boosters, tasks, or upgrades to unlock the next level
        </motion.p>
      )}

      {/* Upgrade button */}
      <motion.button
        onClick={onUpgrade}
        disabled={!canUpgrade || !isCompleted}
        whileHover={canUpgrade && isCompleted ? { scale: 1.02 } : {}}
        whileTap={canUpgrade && isCompleted ? { scale: 0.98 } : {}}
        className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all ${
          canUpgrade && isCompleted
            ? "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/50"
            : "bg-gray-800 text-gray-500 border-2 border-gray-700 cursor-not-allowed"
        }`}
      >
        {isCompleted
          ? `Upgrade to Level ${nextLevel}`
          : `Spend ${(
              spent_stones_to_upgrade - stonesSpent
            ).toLocaleString()} More Stones`}
      </motion.button>
    </motion.div>
  );
};
