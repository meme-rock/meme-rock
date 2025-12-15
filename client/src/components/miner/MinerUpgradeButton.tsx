import { ArrowUpCircle } from "lucide-react";
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
    const userStoneBalance = useSelector(
      (state: RootState) => state.user.balance_data.stone,
      shallowEqual
    );
    const selectedMinerLevel = useMemo(
      () => parseInt(selectedMiner._id.split("_")[1]),
      [selectedMiner._id]
    );
    const MAX_MINER_LEVEL = 5;

    const requiredStone = selectedMiner.stone_price_to_upgrade;
    const hasEnoughStone = userStoneBalance >= requiredStone;
    const isCurrentLevel = selectedMinerLevel === currentUserMinerLevel;
    const isMaxLevel = selectedMinerLevel >= MAX_MINER_LEVEL;
    const isLocked = selectedMinerLevel > currentUserMinerLevel;

    const handleUpgradeClick = () => {
      if (!hasEnoughStone) {
        WebApp.showAlert(
          `Need ${formatInteger(requiredStone - userStoneBalance)} more stones.`
        );
        return;
      }
      onUpgrade?.();
    };

    if (isMaxLevel) return null; // Max levelde göstermeyelim

    // --- BUTTON STYLES ---
    let buttonBg = "bg-gray-800/50 border-white/5";
    let textColor = "text-gray-500";

    if (isCurrentLevel) {
      buttonBg = hasEnoughStone
        ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.3)] border-amber-400/30"
        : "bg-gray-900 border-amber-900/30";
      textColor = hasEnoughStone ? "text-white" : "text-amber-500/50";
    }

    return (
      <div className="w-full px-4 mb-3 z-30">
        {isLocked ? (
          ""
        ) : (
          <button
            onClick={handleUpgradeClick}
            disabled={!isCurrentLevel || !hasEnoughStone}
            // "overflow-hidden" bazen yetersiz kalabilir, bu yüzden "isolation-auto" veya "transform" eklenebilir ama genelde iç div'e radius vermek çözer.
            className={`w-full relative h-14 rounded-xl flex items-center justify-between px-1 overflow-hidden transition-all active:scale-98 border ${buttonBg}`}
          >
            {/* Left Side: Label */}
            <div className="flex items-center gap-3 px-4 z-10">
              <div
                className={`p-1.5 rounded-full ${
                  hasEnoughStone
                    ? "bg-black/20 text-white"
                    : "bg-amber-900/20 text-amber-700"
                }`}
              >
                <ArrowUpCircle className="w-5 h-5" />
              </div>
              <span
                className={`text-sm font-bold uppercase tracking-wide ${textColor}`}
              >
                Upgrade
              </span>
            </div>

            {/* Right Side: Cost */}
            <div className="flex items-center gap-2 px-4 z-10">
              <span
                className={`text-2xl font-mono font-black ${textColor} ${
                  !hasEnoughStone && "opacity-50"
                }`}
              >
                {formatInteger(requiredStone)}
              </span>
              <img
                src="/stone.svg"
                className={`w-10 h-10 ${
                  !hasEnoughStone && "grayscale opacity-30"
                }`}
                alt="Cost"
              />
            </div>

            {/* Progress Bar Background for Insufficient Funds */}
            {!hasEnoughStone && isCurrentLevel && (
              // DÜZELTME BURADA: 'rounded-xl' sınıfını içteki div'e de ekledik.
              // Bu, koyu gri arka planın butonun köşelerine tam oturmasını sağlar ve taşmayı engeller.
              <div className="absolute inset-0 bg-gray-900 rounded-xl">
                <div
                  className="h-full bg-amber-900/20 rounded-l-xl" // Soldaki dolan kısım için de radius ekledik
                  style={{
                    width: `${(userStoneBalance / requiredStone) * 100}%`,
                  }}
                />
              </div>
            )}
          </button>
        )}
      </div>
    );
  }
);
