import { motion } from "framer-motion";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { useMineMutation } from "../../redux/services/miner/miner-api";
import WebApp from "@twa-dev/sdk";
import { memo } from "react";
import { EMinerRewardType } from "../../types/enums";
import { useCountdown } from "../../hooks/useCountdown";
import { useMinerPeriods } from "../../hooks/useMinerPeriods";
import { Warehouse, Lock } from "lucide-react";

interface MiningProgressProps {
  hourlyReward: number;
  rewardType: EMinerRewardType;
  isCurrentMiner: boolean;
  maxPeriods?: number;
}

export const MineButton = memo(
  ({
    hourlyReward,
    rewardType,
    isCurrentMiner,
    maxPeriods: propMaxPeriods,
  }: MiningProgressProps) => {
    const userId = useSelector((state: RootState) => state.user._id);
    const minerData = useSelector(
      (state: RootState) => state.user.miner_data,
      shallowEqual
    );
    const isPremium = useSelector((state: RootState) => state.user.is_premium);
    const isAutoMining = useSelector(
      (state: RootState) => state.user.is_auto_mining
    );
    const [mine, { isLoading: isClaiming }] = useMineMutation();

    const { claimablePeriods, nextMine } = useMinerPeriods(
      isCurrentMiner ? minerData.last_mine : new Date().toISOString(),
      isCurrentMiner ? minerData.max_periods : propMaxPeriods || 0,
      isPremium,
      isAutoMining
    );

    const maxPeriods = isCurrentMiner
      ? minerData.max_periods
      : propMaxPeriods || 0;
    const isStorageFull = isCurrentMiner && claimablePeriods >= maxPeriods;
    const canClaim = isCurrentMiner && claimablePeriods > 0;
    const displayReward = hourlyReward * claimablePeriods;
    const { formattedTime } = useCountdown(nextMine);
    const progressPercent = isCurrentMiner
      ? Math.min((claimablePeriods / maxPeriods) * 100, 100)
      : 0;

    const handleClaim = async () => {
      try {
        await mine({ user_id: userId }).unwrap();
        WebApp.showAlert(
          `Successfully claimed ${displayReward} ${rewardType}!`
        );
      } catch (error: any) {
        WebApp.showAlert(error?.data?.message || "Failed to claim");
      }
    };

    return (
      <div className="w-full px-4 mb-24">
        {/* Bottom Padding for Navigation */}
        {isCurrentMiner && (
          <div className="relative w-full h-[85px] rounded-2xl overflow-hidden flex shadow-2xl backdrop-blur-xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-white/10 group">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />

            {/* LEFT SIDE: STORAGE INFO (65%) */}
            <div className="flex-[1.5] p-3 flex flex-col justify-center relative border-r border-white/5">
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-200/60">
                    Storage
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold ${
                    isStorageFull ? "text-red-400" : "text-cyan-400"
                  }`}
                >
                  {claimablePeriods} / {maxPeriods}
                </span>
              </div>

              {/* Values */}
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl font-black ${
                    isStorageFull ? "text-red-100" : "text-white"
                  }`}
                >
                  {isCurrentMiner
                    ? isStorageFull
                      ? "FULL"
                      : formattedTime
                    : `${maxPeriods}H`}
                </span>
              </div>

              {/* Storage Bar */}
              {isCurrentMiner && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
                  <motion.div
                    className={`h-full shadow-[0_0_10px_rgba(34,211,238,0.5)] ${
                      isStorageFull ? "bg-red-500" : "bg-cyan-400"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>

            {/* RIGHT SIDE: CLAIM BUTTON (35%) */}
            {isCurrentMiner ? (
              <button
                onClick={handleClaim}
                disabled={!canClaim || isClaiming}
                className={`flex-1 relative flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
                  canClaim && !isClaiming
                    ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-50"
                    : "bg-black/20 text-gray-500 cursor-not-allowed"
                }`}
              >
                {canClaim && !isClaiming && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-transparent opacity-50" />
                )}

                {canClaim && !isClaiming ? (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
                      CLAIM
                    </span>
                    <div className="flex items-center gap-1 z-10">
                      <span className="text-lg font-black text-white drop-shadow-md">
                        {displayReward}
                      </span>
                      <img
                        src={
                          rewardType === EMinerRewardType.STONE
                            ? "/stone.svg"
                            : "/dust.svg"
                        }
                        className="w-8 h-8"
                        alt=""
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center z-10 opacity-60">
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                      {isClaiming ? "Processing" : "Mining"}
                    </span>
                    <div className="flex gap-1">
                      <div
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      />
                      <div
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                )}
              </button>
            ) : (
              <div className="flex-1 bg-black/40 flex items-center justify-center border-l border-white/5">
                <Lock className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
