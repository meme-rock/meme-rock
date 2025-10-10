import { motion } from "framer-motion";
import { Lock, CheckCircle, ArrowUp } from "lucide-react";

interface Requirement {
  type: "stones" | "level" | "task";
  label: string;
  current: number;
  required: number;
  completed: boolean;
}

interface UpgradeRequirementsProps {
  currentLevel: number;
  nextLevel: number;
  requirements: Requirement[];
  canUpgrade: boolean;
  onUpgrade: () => void;
}

export const UpgradeRequirements = ({
  currentLevel,
  nextLevel,
  requirements,
  canUpgrade,
  onUpgrade,
}: UpgradeRequirementsProps) => {
  const allCompleted = requirements.every((req) => req.completed);

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
        {allCompleted && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
          </motion.div>
        )}
      </div>

      {/* Requirements list */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-3">
        {requirements.map((req, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              req.completed
                ? "bg-green-900/20 border-green-700/50"
                : "bg-gray-800/50 border-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              {req.completed ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500 flex-shrink-0" />
              )}
              <div>
                <p
                  className={`font-medium ${
                    req.completed ? "text-green-400" : "text-gray-300"
                  }`}
                >
                  {req.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {req.type === "stones" && (
                    <img src="/stone.svg" alt="Stone" className="w-4 h-4" />
                  )}
                  <p className="text-sm text-gray-400">
                    {req.current.toLocaleString()} /{" "}
                    {req.required.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex flex-col items-end">
              <span
                className={`text-xs font-bold ${
                  req.completed ? "text-green-400" : "text-gray-500"
                }`}
              >
                {Math.min(100, (req.current / req.required) * 100).toFixed(0)}%
              </span>
              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      (req.current / req.required) * 100
                    )}%`,
                  }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className={`h-full ${
                    req.completed
                      ? "bg-gradient-to-r from-green-500 to-green-400"
                      : "bg-gradient-to-r from-cyan-600 to-cyan-500"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upgrade button */}
      <motion.button
        onClick={onUpgrade}
        disabled={!canUpgrade || !allCompleted}
        whileHover={canUpgrade && allCompleted ? { scale: 1.02 } : {}}
        whileTap={canUpgrade && allCompleted ? { scale: 0.98 } : {}}
        className={`w-full mt-4 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
          canUpgrade && allCompleted
            ? "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/50"
            : "bg-gray-800 text-gray-500 border-2 border-gray-700 cursor-not-allowed"
        }`}
      >
        {allCompleted
          ? `Upgrade to Level ${nextLevel}`
          : "Complete Requirements"}
      </motion.button>
    </motion.div>
  );
};
