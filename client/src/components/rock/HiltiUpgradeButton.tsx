import { ArrowUpCircle, Lock } from "lucide-react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { memo, useMemo } from "react";
import { IHiltiDetail } from "../../types";
import WebApp from "@twa-dev/sdk";
import { formatInteger } from "../../utils/formatNumber";

interface HiltiUpgradeButtonProps {
  selectedHilti: IHiltiDetail;
  currentUserHiltiLevel: number;
  onUpgrade: () => void;
  isUpgrading: boolean;
}

export const HiltiUpgradeButton = memo(
  ({
    selectedHilti,
    currentUserHiltiLevel,
    onUpgrade,
    isUpgrading,
  }: HiltiUpgradeButtonProps) => {
    const userStoneBalance = useSelector(
      (state: RootState) => state.user.balance_data.stone,
      shallowEqual
    );
    const userProfitPerHour = useSelector(
      (state: RootState) => state.user.airdrop_data.profit_per_hour,
      shallowEqual
    );
    const selectedHiltiLevel = useMemo(
      () => parseInt(selectedHilti._id.split("_")[1]),
      [selectedHilti._id]
    );
    const MAX_HILTI_LEVEL = 5;

    // Yükseltme Gereksinimleri
    const requiredStone = selectedHilti.stone_price_to_upgrade || 0;
    const requiredPPH = selectedHilti.profit_per_hour_to_upgrade || 0;

    // Yeterlilik Kontrolleri
    const hasEnoughStone = userStoneBalance >= requiredStone;
    const hasEnoughPPH = userProfitPerHour >= requiredPPH;
    const canUpgradeNow = hasEnoughStone && hasEnoughPPH; // Her iki koşul da sağlanmalı

    const isCurrentLevel = selectedHiltiLevel === currentUserHiltiLevel;
    const isMaxLevel = selectedHiltiLevel >= MAX_HILTI_LEVEL;
    const isLocked = selectedHiltiLevel > currentUserHiltiLevel;

    // Yalnızca mevcut seviye seçiliyken ve max seviyede değilken gösterilir
    const showRequirements = isCurrentLevel && !isMaxLevel;

    const handleUpgradeClick = () => {
      if (!isCurrentLevel) return;

      if (!canUpgradeNow) {
        if (!hasEnoughPPH && requiredPPH > 0) {
          WebApp.showAlert(
            `You need at least ${formatInteger(
              requiredPPH
            )} ROCK/hour to upgrade.`
          );
        } else if (!hasEnoughStone && requiredStone > 0) {
          WebApp.showAlert(
            `Need ${formatInteger(
              requiredStone - userStoneBalance
            )} more stones.`
          );
        }
        return;
      }
      onUpgrade();
    };

    if (isMaxLevel || isLocked) return null; // Max levelde veya kilitliyse gösterme

    // --- BUTTON STYLES ---
    let buttonBg;
    let textColor;
    let buttonAction;

    if (canUpgradeNow) {
      buttonBg =
        "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/30";
      textColor = "text-white";
      buttonAction = "hover:from-cyan-500 hover:to-blue-500 active:scale-98";
    } else {
      buttonBg = "bg-gray-900 border-red-900/30";
      textColor = "text-red-500/50";
      buttonAction = "cursor-not-allowed";
    }

    // PPH Gereksinim Kutusu Stilleri
    const pphBoxBg = hasEnoughPPH
      ? "bg-cyan-900/50 border-cyan-700/50"
      : "bg-red-900/50 border-red-700/50";
    const pphValueColor = hasEnoughPPH ? "text-cyan-400" : "text-red-400";
    const pphLabelColor = hasEnoughPPH ? "text-gray-400" : "text-red-300";

    return (
      <div className="w-full px-4 mb-8 z-30">
        {/* PROFIT PER HOUR REQUIREMENT BOX (Butonun Hemen Üstünde) */}
        {showRequirements && requiredPPH > 0 && (
          <div
            className={`flex justify-between items-center px-4 py-2 rounded-xl mb-3 border backdrop-blur-md transition-colors ${pphBoxBg}`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${pphLabelColor}`}>
                REQUIRED PPH:
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`text-lg font-black font-mono ${pphValueColor}`}
                >
                  {formatInteger(requiredPPH)}
                </span>
                <img
                  src="/rock.svg"
                  alt="Rock"
                  className="w-5 h-5 opacity-80"
                />
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-400 block">YOUR PPH:</span>
              <div className="flex items-center justify-end gap-1">
                <span
                  className={`text-lg font-black font-mono ${pphValueColor}`}
                >
                  {formatInteger(userProfitPerHour)}
                </span>
                <img
                  src="/rock.svg"
                  alt="Rock"
                  className="w-5 h-5 opacity-80"
                />
              </div>
            </div>
          </div>
        )}

        {/* UPGRADE BUTTON */}
        <button
          onClick={handleUpgradeClick}
          disabled={!isCurrentLevel || !canUpgradeNow || isUpgrading}
          className={`w-full relative h-14 rounded-xl flex items-center justify-between px-1 overflow-hidden transition-all border ${buttonBg} ${buttonAction} ${
            isUpgrading || !canUpgradeNow ? "opacity-50" : ""
          }`}
        >
          {/* Left Side: Label */}
          <div className="flex items-center gap-3 px-4 z-10">
            <div
              className={`p-1.5 rounded-full ${
                canUpgradeNow
                  ? "bg-black/20 text-white"
                  : "bg-red-900/20 text-red-700"
              }`}
            >
              {isUpgrading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUpCircle className="w-5 h-5" />
              )}
            </div>
            <span
              className={`text-sm font-bold uppercase tracking-wide ${textColor}`}
            >
              {isUpgrading ? "Upgrading..." : "Upgrade"}
            </span>
          </div>

          {/* Right Side: Cost */}
          <div className="flex items-center gap-2 px-4 z-10">
            <span
              className={`text-2xl font-mono font-black ${textColor} ${
                !canUpgradeNow && "opacity-50"
              }`}
            >
              {formatInteger(requiredStone)}
            </span>
            <img
              src="/stone.svg"
              className={`w-10 h-10 ${
                !canUpgradeNow && "grayscale opacity-30"
              }`}
              alt="Cost"
            />
          </div>

          {/* Progress Bar Background for Insufficient Stone Funds */}
          {!hasEnoughStone && isCurrentLevel && (
            <div className="absolute inset-0 bg-gray-900 rounded-xl">
              <div
                className="h-full bg-red-900/20 rounded-l-xl"
                style={{
                  width: `${(userStoneBalance / requiredStone) * 100}%`,
                }}
              />
            </div>
          )}

          {/* Lock overlay when PPH is insufficient, but Stone is sufficient (Visual Feedback) */}
          {!canUpgradeNow && isCurrentLevel && (
            <div
              className={`absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 z-20 transition-opacity`}
            >
              <div className="flex flex-col items-center justify-center gap-1 p-2">
                <Lock className="w-6 h-6 text-red-400" />
                <span className="text-xs text-red-200 font-semibold uppercase tracking-wider">
                  {!hasEnoughPPH && requiredPPH > 0
                    ? "PPH Required"
                    : "Stone Required"}
                </span>
              </div>
            </div>
          )}
        </button>
      </div>
    );
  }
);
