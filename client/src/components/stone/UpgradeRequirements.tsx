import { motion } from "framer-motion";
import { CheckCircle, ArrowUp, Users } from "lucide-react";

interface UpgradeRequirementsProps {
  nextLevel: number;
  // Invite requirements
  inviteCount: number;
  requiredInvites: number;
  // Dust requirements
  dustSpent: number;
  requiredDust: number;
  // Stone requirements
  stonesSpent: number;
  requiredStones: number;
  canUpgrade: boolean;
  onUpgrade: () => void;
}

export const UpgradeRequirements = ({
  nextLevel,
  inviteCount = 0,
  requiredInvites = 0,
  dustSpent = 0,
  requiredDust = 0,
  stonesSpent = 0,
  requiredStones = 0,
  canUpgrade,
  onUpgrade,
}: UpgradeRequirementsProps) => {
  // Check individual completions
  const inviteCompleted = inviteCount >= requiredInvites;
  const dustCompleted = dustSpent >= requiredDust;
  const stoneCompleted = stonesSpent >= requiredStones;

  // Check if invite AND dust are both completed (first option)
  const firstOptionCompleted = inviteCompleted && dustCompleted;

  // Check if stones are completed (second option)
  const secondOptionCompleted = stoneCompleted;

  // Overall completion: either first option OR second option
  const isCompleted = firstOptionCompleted || secondOptionCompleted;

  // Calculate progress percentages
  const inviteProgress = Math.min(100, (inviteCount / requiredInvites) * 100);
  const dustProgress = Math.min(100, (dustSpent / requiredDust) * 100);
  const stoneProgress = Math.min(100, (stonesSpent / requiredStones) * 100);

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

      {/* First Option: Invite AND Dust */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-3">
        <div className="space-y-3">
          {/* Invite Requirement */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              inviteCompleted
                ? "bg-green-900/20 border-green-700/50"
                : "bg-gray-800/50 border-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  inviteCompleted
                    ? "bg-green-600/20 border border-green-600/30"
                    : "bg-gray-800 border border-gray-700"
                }`}
              >
                {inviteCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Users className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <div>
                <p
                  className={`font-semibold text-sm mb-1 ${
                    inviteCompleted ? "text-green-400" : "text-white"
                  }`}
                >
                  Invite Friends
                </p>
                <p className="text-xs text-gray-400">
                  {inviteCount} / {requiredInvites}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`text-sm font-bold mb-1 ${
                  inviteCompleted ? "text-green-400" : "text-cyan-400"
                }`}
              >
                {inviteProgress.toFixed(0)}%
              </span>
              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${inviteProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className={`h-full ${
                    inviteCompleted
                      ? "bg-gradient-to-r from-green-500 to-green-400"
                      : "bg-gradient-to-r from-cyan-600 to-cyan-500"
                  }`}
                />
              </div>
            </div>
          </motion.div>

          {/* Dust Requirement */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              dustCompleted
                ? "bg-green-900/20 border-green-700/50"
                : "bg-gray-800/50 border-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  dustCompleted
                    ? "bg-green-600/20 border border-green-600/30"
                    : "bg-gray-800 border border-gray-700"
                }`}
              >
                {dustCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <img src="/dust.svg" alt="Dust" className="w-6 h-6" />
                )}
              </div>
              <div>
                <p
                  className={`font-semibold text-sm mb-1 ${
                    dustCompleted ? "text-green-400" : "text-white"
                  }`}
                >
                  Spend Dust
                </p>
                <p className="text-xs text-gray-400">
                  {dustSpent.toLocaleString()} / {requiredDust.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`text-sm font-bold mb-1 ${
                  dustCompleted ? "text-green-400" : "text-cyan-400"
                }`}
              >
                {dustProgress.toFixed(0)}%
              </span>
              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dustProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className={`h-full ${
                    dustCompleted
                      ? "bg-gradient-to-r from-green-500 to-green-400"
                      : "bg-gradient-to-r from-cyan-600 to-cyan-500"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* OR Divider */}
      <div className="flex items-center gap-3 mb-3 px-4">
        <div className="flex-1 h-px bg-gray-700"></div>
        <span className="text-sm font-bold text-gray-400">OR</span>
        <div className="flex-1 h-px bg-gray-700"></div>
      </div>

      {/* Second Option: Stones */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
            stoneCompleted
              ? "bg-green-900/20 border-green-700/50"
              : "bg-gray-800/50 border-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stoneCompleted
                  ? "bg-green-600/20 border border-green-600/30"
                  : "bg-gray-800 border border-gray-700"
              }`}
            >
              {stoneCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <img src="/stone.svg" alt="Stone" className="w-6 h-6" />
              )}
            </div>
            <div>
              <p
                className={`font-semibold text-sm mb-1 ${
                  stoneCompleted ? "text-green-400" : "text-white"
                }`}
              >
                Spend Stones
              </p>
              <p className="text-xs text-gray-400">
                {stonesSpent.toLocaleString()} /{" "}
                {requiredStones.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span
              className={`text-sm font-bold mb-1 ${
                stoneCompleted ? "text-green-400" : "text-cyan-400"
              }`}
            >
              {stoneProgress.toFixed(0)}%
            </span>
            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stoneProgress}%` }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className={`h-full ${
                  stoneCompleted
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
          transition={{ delay: 1 }}
          className="text-sm text-gray-400 text-center mb-4 px-4"
        >
          Complete either option to unlock the next level
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
          : "Complete Requirements to Upgrade"}
      </motion.button>
    </motion.div>
  );
};
