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
    const progressPercent = Math.min(
      (userStoneBalance / requiredStone) * 100,
      100
    );

    const handleUpgradeClick = () => {
      if (!hasEnoughStone) {
        WebApp.showAlert(
          `Need ${formatInteger(requiredStone - userStoneBalance)} more stones.`
        );
        return;
      }
      onUpgrade?.();
    };

    if (isMaxLevel || isLocked) return null;

    return (
      <div className="w-full px-4 z-30">
        <button
          onClick={handleUpgradeClick}
          disabled={!isCurrentLevel || !hasEnoughStone}
          className={`w-full relative h-14 rounded-2xl flex items-center justify-between overflow-hidden transition-all duration-300 active:scale-[0.98] border ${
            hasEnoughStone
              ? "bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400/30 shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 border-slate-700/30"
          }`}
        >
          {/* Progress bar for insufficient funds */}
          {!hasEnoughStone && isCurrentLevel && (
            <div className="absolute inset-0">
              <div
                className="h-full bg-amber-900/25 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Left: Label */}
          <div className="flex items-center gap-3 px-4 z-10">
            <div
              className={`p-1.5 rounded-xl ${
                hasEnoughStone
                  ? "bg-black/20 text-white"
                  : "bg-slate-800/50 text-amber-600"
              }`}
            >
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <span
              className={`text-sm font-bold uppercase tracking-wide ${
                hasEnoughStone ? "text-white" : "text-amber-500/60"
              }`}
            >
              Upgrade
            </span>
          </div>

          {/* Right: Cost */}
          <div className="flex items-center gap-2 px-4 z-10">
            <span
              className={`text-xl font-mono font-black ${
                hasEnoughStone ? "text-white" : "text-slate-400"
              }`}
            >
              {formatInteger(requiredStone)}
            </span>
            <img
              src="/stone.svg"
              className={`w-8 h-8 transition-all ${
                !hasEnoughStone ? "grayscale opacity-40" : ""
              }`}
              alt="Stone"
            />
          </div>
        </button>
      </div>
    );
  }
);
