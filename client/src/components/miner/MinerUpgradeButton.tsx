import { motion } from "framer-motion";
import { Lock, ArrowUp, Zap } from "lucide-react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { memo, useMemo } from "react";
import { IMinerDetail } from "../../types";
import WebApp from "@twa-dev/sdk";
import { formatInteger } from "../../utils/formatNumber";

interface MinerUpgradeButtonProps {
  selectedMiner: IMinerDetail;
  currentUserMinerLevel: number;
  onUpgrade?: () => void;
}

export const MinerUpgradeButton = memo(
  ({
    selectedMiner,
    currentUserMinerLevel,
    onUpgrade,
  }: MinerUpgradeButtonProps) => {
    // Kullanıcının stone balance'ı
    const userStoneBalance = useSelector(
      (state: RootState) => state.user.balance_data.stone,
      shallowEqual
    );

    // Seçili miner'ın seviyesi
    const selectedMinerLevel = useMemo(
      () => parseInt(selectedMiner._id.split("_")[1]),
      [selectedMiner._id]
    );

    // Maksimum seviye
    const MAX_MINER_LEVEL = 5;

    // Eğer bu maksimum seviye ise upgrade butonu gösterme (kilitli bile olsa)
    if (selectedMinerLevel >= MAX_MINER_LEVEL) {
      return null;
    }

    // Bu miner kilitli mi?
    const isLockedMiner = selectedMinerLevel > currentUserMinerLevel;

    // Upgrade için gereken stone
    const requiredStone = selectedMiner.stone_price_to_upgrade;

    // Kullanıcı yeterli stone'a sahip mi?
    const hasEnoughStone = userStoneBalance >= requiredStone;

    // Upgrade mümkün mü? (mevcut seviyedeyken göster)
    const canUpgrade =
      selectedMinerLevel === currentUserMinerLevel && hasEnoughStone;

    // Eğer bu mevcut miner ise upgrade butonu göster
    if (selectedMinerLevel === currentUserMinerLevel) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md px-4"
        >
          <div className="relative">
            {/* Glow effect when can upgrade */}
            {canUpgrade && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-xl rounded-2xl" />
            )}

            <motion.button
              onClick={() => {
                if (!canUpgrade) {
                  WebApp.showAlert(
                    `You need ${formatInteger(
                      requiredStone
                    )} stone to upgrade. You have ${formatInteger(
                      userStoneBalance
                    )} stone.`
                  );
                  return;
                }
                onUpgrade?.();
              }}
              disabled={!canUpgrade}
              whileTap={canUpgrade ? { scale: 0.95 } : {}}
              className={`relative w-full rounded-2xl px-6 py-4 border-2 transition-all duration-300 ${
                canUpgrade
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 shadow-lg shadow-cyan-500/50"
                  : "bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Icon and text */}
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      canUpgrade ? "bg-white/20" : "bg-gray-700/50"
                    }`}
                  >
                    {canUpgrade ? (
                      <Zap className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <p
                      className={`font-bold text-sm ${
                        canUpgrade ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {canUpgrade
                        ? "Upgrade to Level " + (selectedMinerLevel + 1)
                        : "Insufficient Stone"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src="/stone.svg"
                        alt="Stone"
                        className={`w-5 h-5 ${
                          canUpgrade
                            ? "drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                            : "drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                        }`}
                      />
                      <span
                        className={`text-sm font-bold ${
                          hasEnoughStone ? "text-cyan-200" : "text-red-400"
                        }`}
                      >
                        {formatInteger(userStoneBalance)} /{" "}
                        {formatInteger(requiredStone)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Arrow */}
                <motion.div
                  animate={
                    canUpgrade
                      ? {
                          y: [0, -4, 0],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowUp
                    className={`w-6 h-6 ${
                      canUpgrade ? "text-white" : "text-gray-600"
                    }`}
                  />
                </motion.div>
              </div>

              {/* Progress bar for stone collection */}
              {!hasEnoughStone && (
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(userStoneBalance / requiredStone) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-gray-600 to-gray-500"
                    />
                  </div>
                </div>
              )}
            </motion.button>
          </div>
        </motion.div>
      );
    }

    // Eğer bu miner kilitli ise
    if (isLockedMiner) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md px-4"
        >
          <div className="relative">
            <motion.button
              disabled
              className="relative w-full rounded-2xl px-6 py-4 border-2 transition-all duration-300 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700/50 backdrop-blur-sm cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                {/* Left side - Icon and text */}
                <div className="flex items-center gap-3">
                  <div className="bg-gray-700/50 p-2 rounded-lg">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-400 text-sm font-medium">
                      Locked Level {selectedMinerLevel}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src="/stone.svg"
                        alt="Stone"
                        className="w-5 h-5 drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                      />
                      <span className="text-xs font-bold text-gray-300">
                        {formatInteger(requiredStone)} stone to upgrade
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Lock Icon */}
                <div>
                  <Lock className="w-6 h-6 text-gray-600" />
                </div>
              </div>

              {/* Info text */}
              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <p className="text-gray-500 text-xs text-center">
                  Unlock previous levels first
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      );
    }

    return null;
  }
);
