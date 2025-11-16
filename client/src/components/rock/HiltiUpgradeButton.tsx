import { motion } from "framer-motion";
import { Lock, ArrowUp, CheckCircle } from "lucide-react";
import { IHiltiDetail } from "../../types";
import { formatInteger } from "../../utils/formatNumber";

interface HiltiUpgradeButtonProps {
  selectedHilti: IHiltiDetail;
  selectedHiltiLevel: number;
  currentUserHiltiLevel: number;
  userStoneBalance: number;
  userProfitPerHour: number;
  onUpgrade: () => void;
  isUpgrading: boolean;
}

export const HiltiUpgradeButton = ({
  selectedHilti,
  selectedHiltiLevel,
  currentUserHiltiLevel,
  userStoneBalance,
  userProfitPerHour,
  onUpgrade,
  isUpgrading,
}: HiltiUpgradeButtonProps) => {
  const MAX_HILTI_LEVEL = 5;

  // Eğer bu maksimum seviye ise upgrade butonu gösterme (kilitli bile olsa)
  if (selectedHiltiLevel >= MAX_HILTI_LEVEL) {
    return null;
  }

  // Upgrade gereksinimleri
  const requiredStone = selectedHilti.stone_price_to_upgrade || 0;
  const requiredProfitPerHour = selectedHilti.profit_per_hour_to_upgrade || 0;

  // Gereksinimlerin karşılanıp karşılanmadığını kontrol et
  const hasEnoughStone = userStoneBalance >= requiredStone;
  const hasEnoughProfitPerHour = userProfitPerHour >= requiredProfitPerHour;
  const canUpgrade = hasEnoughStone && hasEnoughProfitPerHour;

  // Eğer bu mevcut seviye ise, upgrade butonu göster
  const isCurrentLevel = selectedHiltiLevel === currentUserHiltiLevel;

  // Eğer bu sonraki seviye (kilitli) ise, gereksinimleri göster
  const isNextLevel = selectedHiltiLevel === currentUserHiltiLevel + 1;

  if (!isCurrentLevel && !isNextLevel) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-md mx-auto mt-8 px-4"
    >
      {/* Requirements Display */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <ArrowUp className="w-5 h-5" />
            Upgrade to Level {selectedHiltiLevel + 1}
          </h3>
          {canUpgrade && isCurrentLevel && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <CheckCircle className="w-6 h-6 text-green-400" />
            </motion.div>
          )}
        </div>

        {/* Requirements List */}
        <div className="space-y-3">
          {/* Stone Requirement */}
          {requiredStone > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                hasEnoughStone
                  ? "bg-green-900/20 border-green-700/50"
                  : "bg-gray-800/50 border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hasEnoughStone
                      ? "bg-green-600/20 border border-green-600/30"
                      : "bg-gray-800 border border-gray-700"
                  }`}
                >
                  {hasEnoughStone ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <img
                      src="/stone.svg"
                      alt="Stone"
                      className={`w-6 h-6 ${
                        hasEnoughStone
                          ? "drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                          : "drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                      }`}
                    />
                  )}
                </div>
                <div>
                  <p
                    className={`font-semibold text-sm mb-1 ${
                      hasEnoughStone ? "text-green-400" : "text-white"
                    }`}
                  >
                    Stone Required
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <span
                      className={`font-bold ${
                        hasEnoughStone ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatInteger(userStoneBalance)}
                    </span>
                    <span className="text-gray-500">/</span>
                    <span className="text-cyan-400">
                      {formatInteger(requiredStone)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span
                  className={`text-sm font-bold ${
                    hasEnoughStone ? "text-green-400" : "text-cyan-400"
                  }`}
                >
                  {Math.min(
                    100,
                    (userStoneBalance / requiredStone) * 100
                  ).toFixed(0)}
                  %
                </span>
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        100,
                        (userStoneBalance / requiredStone) * 100
                      )}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className={`h-full ${
                      hasEnoughStone
                        ? "bg-gradient-to-r from-green-500 to-green-400"
                        : "bg-gradient-to-r from-cyan-600 to-cyan-500"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Profit Per Hour Requirement */}
          {requiredProfitPerHour > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                hasEnoughProfitPerHour
                  ? "bg-green-900/20 border-green-700/50"
                  : "bg-gray-800/50 border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hasEnoughProfitPerHour
                      ? "bg-green-600/20 border border-green-600/30"
                      : "bg-gray-800 border border-gray-700"
                  }`}
                >
                  {hasEnoughProfitPerHour ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <img
                      src="/rock.svg"
                      alt="Rock"
                      className={`w-6 h-6 ${
                        hasEnoughProfitPerHour
                          ? "drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]"
                          : "drop-shadow-[0_0_4px_rgba(168,85,247,0.5)]"
                      }`}
                    />
                  )}
                </div>
                <div>
                  <p
                    className={`font-semibold text-sm mb-1 ${
                      hasEnoughProfitPerHour ? "text-green-400" : "text-white"
                    }`}
                  >
                    Profit Per Hour Required
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <span
                      className={`font-bold ${
                        hasEnoughProfitPerHour
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatInteger(userProfitPerHour)}
                    </span>
                    <span className="text-gray-500">/</span>
                    <span className="text-purple-400">
                      {formatInteger(requiredProfitPerHour)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span
                  className={`text-sm font-bold ${
                    hasEnoughProfitPerHour
                      ? "text-green-400"
                      : "text-purple-400"
                  }`}
                >
                  {Math.min(
                    100,
                    (userProfitPerHour / requiredProfitPerHour) * 100
                  ).toFixed(0)}
                  %
                </span>
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        100,
                        (userProfitPerHour / requiredProfitPerHour) * 100
                      )}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className={`h-full ${
                      hasEnoughProfitPerHour
                        ? "bg-gradient-to-r from-green-500 to-green-400"
                        : "bg-gradient-to-r from-purple-600 to-purple-500"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Info text for locked level */}
        {isNextLevel && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-400 text-center mt-4"
          >
            Complete requirements to unlock this level
          </motion.p>
        )}
      </div>

      {/* Upgrade Button - Only show for current level */}
      {isCurrentLevel && (
        <motion.button
          onClick={onUpgrade}
          disabled={isUpgrading || !canUpgrade}
          whileHover={canUpgrade && !isUpgrading ? { scale: 1.02 } : {}}
          whileTap={canUpgrade && !isUpgrading ? { scale: 0.98 } : {}}
          className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
            isUpgrading
              ? "bg-gray-800 text-gray-500 border-2 border-gray-700 cursor-not-allowed"
              : canUpgrade
              ? "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/50"
              : "bg-gray-800 text-gray-500 border-2 border-gray-700 cursor-not-allowed"
          }`}
        >
          {isUpgrading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-gray-600 border-t-cyan-400 rounded-full"
              />
              Upgrading...
            </>
          ) : canUpgrade ? (
            <>
              <ArrowUp className="w-5 h-5" />
              Upgrade to Level {selectedHiltiLevel + 1}
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Complete Requirements to Upgrade
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};
