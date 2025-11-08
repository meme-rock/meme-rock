import { motion } from "framer-motion";
import {
  Lock,
  Unlock,
  TrendingUp,
  Zap,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { IBooster } from "../../types";
import {
  useUnlockBoosterMutation,
  useUpgradeBoosterMutation,
} from "../../redux/services/booster/booster-api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import WebApp from "@twa-dev/sdk";
import { useState } from "react";
import { BoosterConfirmModal } from "./BoosterConfirmModal";

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

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const currentLevel = booster.current_level || 0;
  const isUnlocked = booster.is_unlocked || false;

  // Check unlock requirements
  const requirements = booster.unlock_requirements;
  const hasStoneReq = (requirements.stone ?? 0) > 0;
  const hasDustReq = (requirements.dust ?? 0) > 0;
  const hasInviteReq = (requirements.invite ?? 0) > 0;

  // Check if user meets requirements
  const meetsStoneReq =
    !hasStoneReq || user.balance_data.stone >= (requirements.stone ?? 0);
  const meetsDustReq =
    !hasDustReq || user.balance_data.dust >= (requirements.dust ?? 0);
  const meetsInviteReq =
    !hasInviteReq || user.invite_count >= (requirements.invite ?? 0);

  // All requirements met
  const allRequirementsMet = meetsStoneReq && meetsDustReq && meetsInviteReq;

  const handleUnlockClick = () => {
    if (!allRequirementsMet) {
      WebApp.showAlert(
        "You don't meet all the requirements to unlock this booster."
      );
      return;
    }
    setShowUnlockModal(true);
  };

  const handleUnlockConfirm = async () => {
    try {
      console.log("Unlocking booster:", booster._id);
      const result = await unlockBooster({
        user_id: user._id,
        booster_id: booster._id,
      }).unwrap();
      console.log("✅ Booster unlocked successfully!", result);
      setShowUnlockModal(false);
    } catch (error: any) {
      console.error("❌ Failed to unlock booster:", error);
      WebApp.showAlert(
        error?.data?.message || "Failed to unlock booster. Please try again."
      );
    }
  };

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = async () => {
    try {
      console.log("Upgrading booster:", booster._id);
      const result = await upgradeBooster({
        user_id: user._id,
        booster_id: booster._id,
      }).unwrap();
      console.log("✅ Booster upgraded successfully!", result);
      setShowUpgradeModal(false);
    } catch (error: any) {
      console.error("❌ Failed to upgrade booster:", error);
      WebApp.showAlert(
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

      {/* Progress bar - Always show max level */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-semibold">
            {isUnlocked
              ? `Level ${currentLevel} / ${booster.max_level}`
              : `Max Level: ${booster.max_level}`}
          </span>
        </div>
        {isUnlocked && (
          <div className="relative w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600"
            />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 relative z-10">
        {isLevelLocked ? (
          <div></div>
        ) : !isUnlocked ? (
          <button
            onClick={handleUnlockClick}
            disabled={isUnlocking || !allRequirementsMet}
            className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 relative overflow-hidden group ${
              isUnlocking
                ? "opacity-50 cursor-not-allowed bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600"
                : allRequirementsMet
                ? "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-blue-500 active:scale-95 shadow-lg shadow-cyan-500/30"
                : "bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed opacity-60"
            }`}
          >
            {/* Shine effect - only when unlockable */}
            {allRequirementsMet && !isUnlocking && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            )}
            {isUnlocking ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                <span className="relative z-10">Unlocking...</span>
              </>
            ) : (
              <>
                {allRequirementsMet ? (
                  <Unlock className="w-5 h-5 relative z-10" />
                ) : (
                  <Lock className="w-5 h-5 relative z-10" />
                )}
                <span className="relative z-10">Unlock</span>
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
            onClick={handleUpgradeClick}
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
                <span className="relative z-10 text-lg font-bold">
                  Upgrade
                </span>
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

      {/* Unlock Requirements - Show below unlock button */}
      {!isLevelLocked && !isUnlocked && (
        <div className="mt-4 pt-4 border-t border-gray-800/50 relative z-10">
          <p className="text-xs text-gray-400 font-semibold mb-3">
            Unlock Requirements:
          </p>
          <div className="space-y-2">
            {hasStoneReq && (
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                  meetsStoneReq
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {meetsStoneReq ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <img src="/stone.svg" alt="Stone" className="w-5 h-5" />
                  <span
                    className={`text-sm font-medium ${
                      meetsStoneReq ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {requirements.stone?.toLocaleString()} Stone
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {user.balance_data.stone.toLocaleString()} /{" "}
                  {requirements.stone?.toLocaleString()}
                </span>
              </div>
            )}
            {hasDustReq && (
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                  meetsDustReq
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {meetsDustReq ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <img src="/dust.svg" alt="Dust" className="w-5 h-5" />
                  <span
                    className={`text-sm font-medium ${
                      meetsDustReq ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {requirements.dust?.toLocaleString()} Dust
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {user.balance_data.dust.toLocaleString()} /{" "}
                  {requirements.dust?.toLocaleString()}
                </span>
              </div>
            )}
            {hasInviteReq && (
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                  meetsInviteReq
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {meetsInviteReq ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <UserPlus className="w-5 h-5 text-purple-400" />
                  <span
                    className={`text-sm font-medium ${
                      meetsInviteReq ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {requirements.invite} Friend
                    {requirements.invite !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {user.invite_count} / {requirements.invite}
                </span>
              </div>
            )}
          </div>
          {/* Info about profit */}
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <TrendingUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <p className="text-xs text-gray-400 font-medium">
              Unlock to earn{" "}
              <span className="text-cyan-400 font-bold">
                +{displayProfit} ROCK/hour
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      <BoosterConfirmModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onConfirm={handleUnlockConfirm}
        isLoading={isUnlocking}
        type="unlock"
        boosterTitle={booster.title}
        cost={{
          amount: hasStoneReq
            ? requirements.stone!
            : hasDustReq
            ? requirements.dust!
            : 0,
          currency: hasStoneReq ? "stone" : hasDustReq ? "dust" : "rock",
        }}
        requirements={requirements}
        userBalance={{
          stone: user.balance_data.stone,
          dust: user.balance_data.dust,
        }}
        profitIncrease={{
          current: 0,
          next: nextProfit,
        }}
      />

      {/* Upgrade Modal */}
      <BoosterConfirmModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onConfirm={handleUpgradeConfirm}
        isLoading={isUpgrading}
        type="upgrade"
        boosterTitle={booster.title}
        currentLevel={currentLevel}
        nextLevel={currentLevel + 1}
        cost={{
          amount: upgradeCost,
          currency: "stone",
        }}
        userBalance={{
          stone: user.balance_data.stone,
          dust: user.balance_data.dust,
        }}
        profitIncrease={{
          current: currentProfit,
          next: nextProfit,
        }}
      />
    </div>
  );
};
