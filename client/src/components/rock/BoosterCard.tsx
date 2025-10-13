import { motion } from "framer-motion";
import { Lock, Unlock, TrendingUp, Zap } from "lucide-react";
import { IBooster } from "../../types";

interface BoosterCardProps {
  booster: IBooster;
  isLevelLocked: boolean;
}

export const BoosterCard = ({ booster, isLevelLocked }: BoosterCardProps) => {
  // TODO: Kullanıcının bu booster'ı açıp açmadığı ve seviyesi backend'den gelecek
  const currentLevel = 0; // Şimdilik 0, backend'den gelecek
  const isUnlocked = false; // Şimdilik false, backend'den gelecek

  const handleUnlock = () => {
    // TODO: Backend'e unlock isteği gönder
    console.log("Unlocking booster:", booster._id);
  };

  const handleUpgrade = () => {
    // TODO: Backend'e upgrade isteği gönder
    console.log("Upgrading booster:", booster._id);
  };

  const isMaxLevel = currentLevel >= booster.max_level;

  // Calculate progress percentage
  const progressPercentage = (currentLevel / booster.max_level) * 100;

  // Get current level data
  const currentLevelData = booster.level_data.find(
    (ld) => ld.level === currentLevel + 1
  );
  const firstLevelData = booster.level_data[0];

  // Unlock cost ve upgrade cost
  const unlockCost = booster.unlock_requirements.stone_pay || 0;
  const upgradeCost =
    currentLevelData?.upgrade_cost || firstLevelData?.upgrade_cost || 0;
  const profitPerHour =
    currentLevelData?.profit_per_hour || firstLevelData?.profit_per_hour || 0;

  return (
    <div
      className={`relative bg-gradient-to-br from-gray-900 via-gray-900 to-black border rounded-2xl p-5 transition-all duration-300 ${
        isLevelLocked
          ? "border-gray-800/50"
          : isUnlocked
          ? "border-cyan-500/40 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20"
          : "border-gray-700/50 hover:border-cyan-600/30 hover:shadow-lg hover:shadow-cyan-700/10"
      }`}
    >
      {/* Background gradient overlay */}
      {!isLevelLocked && !isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl pointer-events-none"></div>
      )}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-2xl pointer-events-none"></div>
      )}
      <div className="flex items-start justify-between mb-4 relative z-10">
        {/* Icon and name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 relative ${
                isLevelLocked
                  ? "bg-gray-800/50 border border-gray-700"
                  : isUnlocked
                  ? "bg-gradient-to-br from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/30"
                  : "bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600"
              }`}
            >
              <img
                src={booster.image_url}
                alt={booster.title}
                className={`w-full h-full object-cover ${
                  isLevelLocked ? "opacity-40" : ""
                }`}
              />
              {isLevelLocked && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-yellow-500/80" />
                </div>
              )}
            </div>
            {/* Badge for unlocked */}
            {isUnlocked && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <Unlock className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1">
              {booster.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/30 font-medium">
                {booster.required_hilti_level.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Rock per hour */}
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end mb-1">
            <img src="/rock.svg" alt="Rock" className="w-5 h-5" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold text-xl">
              +{profitPerHour}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">per hour</p>
        </div>
      </div>

      {/* Progress bar (only if unlocked) */}
      {isUnlocked && (
        <div className="mb-4 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold">
              Level {currentLevel} / {booster.max_level}
            </span>
            <span className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="relative w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 relative"
            >
              {/* Shine effect */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 relative z-10">
        {isLevelLocked ? (
          <button
            disabled
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-500 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 opacity-30"></div>
            <Lock className="w-4 h-4 relative z-10" />
            <span className="relative z-10 text-sm">
              Requires Level{" "}
              {parseInt(booster.required_hilti_level.split("_")[1] || "1")}
            </span>
          </button>
        ) : !isUnlocked ? (
          <button
            onClick={handleUnlock}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 relative overflow-hidden group"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <Unlock className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{unlockCost.toLocaleString()}</span>
            <img
              src="/stone.svg"
              alt="Stone"
              className="w-7 h-7 relative z-10"
            />
          </button>
        ) : isMaxLevel ? (
          <button
            disabled
            className="flex-1 px-4 py-3 bg-green-900/30 border-2 border-green-500/50 text-green-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10"></div>
            <Zap className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Max Level Reached</span>
          </button>
        ) : (
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 relative overflow-hidden group"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <TrendingUp className="w-4 h-4 relative z-10" />
            <span className="relative z-10 text-sm">
              Upgrade for {upgradeCost.toLocaleString()}
            </span>
            <img src="/rock.svg" alt="Rock" className="w-5 h-5 relative z-10" />
          </button>
        )}
      </div>

      {/* Additional info */}
      {isLevelLocked ? (
        <div className="mt-4 pt-4 border-t border-gray-800/50 relative z-10">
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Lock className="w-4 h-4 text-yellow-500/70 flex-shrink-0" />
            <p className="text-xs text-yellow-500/80 font-medium">
              Available at Hilti Level{" "}
              {parseInt(booster.required_hilti_level.split("_")[1] || "1")}
            </p>
          </div>
        </div>
      ) : (
        !isUnlocked && (
          <div className="mt-4 pt-4 border-t border-gray-800/50 relative z-10">
            <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <p className="text-xs text-gray-400 font-medium">
                Unlock to earn{" "}
                <span className="text-cyan-400 font-bold">
                  +{profitPerHour} ROCK/hour
                </span>
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};
