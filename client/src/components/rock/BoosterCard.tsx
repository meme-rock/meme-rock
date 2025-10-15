import { motion } from "framer-motion";
import { Lock, Unlock, TrendingUp, Zap } from "lucide-react";
import { IBooster } from "../../types";
import {
  useUnlockBoosterMutation,
  useUpgradeBoosterMutation,
} from "../../redux/services/booster/booster-api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface BoosterCardProps {
  booster: IBooster;
  isLevelLocked: boolean;
}

export const BoosterCard = ({ booster, isLevelLocked }: BoosterCardProps) => {
  const user = useSelector((state: RootState) => state.user);
  const [unlockBooster, { isLoading: isUnlocking }] =
    useUnlockBoosterMutation();
  const [upgradeBooster, { isLoading: isUpgrading }] =
    useUpgradeBoosterMutation();

  const currentLevel = booster.current_level || 0;
  const isUnlocked = booster.is_unlocked || false;

  const handleUnlock = async () => {
    try {
      console.log("Unlocking booster:", booster._id);
      await unlockBooster({
        user_id: user._id,
        booster_id: booster._id,
      }).unwrap();
      console.log("✅ Booster unlocked successfully!");
    } catch (error: any) {
      console.error("❌ Failed to unlock booster:", error);
      alert(
        error?.data?.message || "Failed to unlock booster. Please try again."
      );
    }
  };

  const handleUpgrade = async () => {
    try {
      console.log("Upgrading booster:", booster._id);
      await upgradeBooster({
        user_id: user._id,
        booster_id: booster._id,
      }).unwrap();
      console.log("✅ Booster upgraded successfully!");
    } catch (error: any) {
      console.error("❌ Failed to upgrade booster:", error);
      alert(
        error?.data?.message || "Failed to upgrade booster. Please try again."
      );
    }
  };

  const isMaxLevel = currentLevel >= booster.max_level;

  // Calculate progress percentage
  const progressPercentage = (currentLevel / booster.max_level) * 100;

  // Get level data
  // Backend zaten filtrelenmiş data gönderiyor:
  // - Locked: [level 1]
  // - Unlocked: [current_level, next_level]
  // Bu yüzden array indexing daha güvenilir
  const levelDataArray = booster.level_data || [];

  let currentLevelData, nextLevelData;

  if (isUnlocked) {
    // Unlocked: level_data[0] = current level, level_data[1] = next level
    currentLevelData =
      levelDataArray.find((ld) => ld.level === currentLevel) ||
      levelDataArray[0];
    nextLevelData =
      levelDataArray.find((ld) => ld.level === currentLevel + 1) ||
      levelDataArray[1];
  } else {
    // Locked: level_data[0] = level 1
    currentLevelData = null;
    nextLevelData = levelDataArray[0]; // Level 1 (unlock için)
  }

  // Costs and profits
  const unlockCost = booster.unlock_requirements.stone_pay || 0;
  const upgradeCost = nextLevelData?.upgrade_cost || 0;

  // Current and next profit
  const currentProfit = currentLevelData?.profit_per_hour || 0;
  const nextProfit = nextLevelData?.profit_per_hour || 0;

  // Display profit (sağ üstte gösterilecek)
  const displayProfit = isUnlocked
    ? currentProfit
    : nextLevelData?.profit_per_hour || 0; // Locked ise level 1 profit'i göster

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
          </div>
        </div>

        {/* Rock per hour */}
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end mb-1">
            <img src="/rock.svg" alt="Rock" className="w-5 h-5" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold text-xl">
              +{displayProfit}
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
          </div>
          <div className="relative w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600"
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 relative z-10">
        {isLevelLocked ? (
          <div></div>
        ) : !isUnlocked ? (
          <button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className={`flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 relative overflow-hidden group ${
              isUnlocking ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            {isUnlocking ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                <span className="relative z-10">Unlocking...</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 relative z-10" />
                <span className="relative z-10">
                  {unlockCost.toLocaleString()}
                </span>
                <img
                  src="/stone.svg"
                  alt="Stone"
                  className="w-7 h-7 relative z-10"
                />
              </>
            )}
          </button>
        ) : isMaxLevel ? (
          <button
            disabled
            className="flex-1 px-4 py-3 bg-green-900/30 border-2 border-green-500/50 text-green-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10"></div>
            <Zap className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Max Level</span>
          </button>
        ) : (
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className={`flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 relative overflow-hidden group ${
              isUpgrading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            {isUpgrading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                <span className="relative z-10 text-sm">Upgrading...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 relative z-10" />
                <span className="relative z-10 text-sm">
                  Upgrade for {upgradeCost.toLocaleString()}
                </span>
                <img
                  src="/rock.svg"
                  alt="Rock"
                  className="w-5 h-5 relative z-10"
                />
              </>
            )}
          </button>
        )}
      </div>

      {/* Profit Comparison - Sadece unlocked ve max level değilse göster */}
      {isUnlocked && !isMaxLevel && nextProfit > 0 && (
        <div className="mt-3 relative z-10">
          <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
            <div className="flex items-center gap-1.5">
              <img src="/rock.svg" alt="Rock" className="w-4 h-4" />
              <span className="text-cyan-300 font-bold text-sm">
                {currentProfit}
              </span>
            </div>
            <span className="text-gray-400 text-sm">→</span>
            <div className="flex items-center gap-1.5">
              <img src="/rock.svg" alt="Rock" className="w-4 h-4" />
              <span className="text-cyan-400 font-bold text-sm">
                {nextProfit}
              </span>
            </div>
            <span className="text-xs text-gray-400 ml-1">per hour</span>
          </div>
        </div>
      )}

      {/* Additional info */}
      {isLevelLocked ? (
        <div></div>
      ) : (
        !isUnlocked && (
          <div className="mt-4 pt-4 border-t border-gray-800/50 relative z-10">
            <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <p className="text-xs text-gray-400 font-medium">
                Unlock to earn{" "}
                <span className="text-cyan-400 font-bold">
                  +{displayProfit} ROCK/hour
                </span>
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};
