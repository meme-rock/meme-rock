import { motion } from "framer-motion";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { useMineMutation } from "../../redux/services/miner/miner-api";
import WebApp from "@twa-dev/sdk";
import { memo } from "react";
import { EMinerRewardType } from "../../types/enums";
import { useCountdown } from "../../hooks/useCountdown";
import { useMinerPeriods } from "../../hooks/useMinerPeriods";
import { Warehouse } from "lucide-react";

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

    if (!isCurrentMiner) return null;

    return (
      <div className="w-full px-4 mb-24">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-700/30 bg-slate-900/60 backdrop-blur-md">
          {/* Progress bar background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className={`h-full transition-colors duration-300 ${
                isStorageFull ? "bg-red-500/10" : "bg-cyan-500/8"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className="relative flex h-[80px]">
            {/* Left: Storage Info */}
            <div className="flex-[1.5] p-3 flex flex-col justify-center border-r border-slate-700/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Warehouse className="w-3.5 h-3.5 text-cyan-500/70" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Storage
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold tabular-nums ${
                    isStorageFull ? "text-red-400" : "text-cyan-400"
                  }`}
                >
                  {claimablePeriods}/{maxPeriods}
                </span>
              </div>

              {/* Timer / Status */}
              <span
                className={`text-xl font-black tabular-nums ${
                  isStorageFull ? "text-red-300" : "text-white"
                }`}
              >
                {isStorageFull ? "FULL" : formattedTime}
              </span>

              {/* Bottom progress line */}
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-800">
                <motion.div
                  className={`h-full rounded-r-full ${
                    isStorageFull
                      ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      : "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Right: Claim Button */}
            <button
              onClick={handleClaim}
              disabled={!canClaim || isClaiming}
              className={`flex-1 relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 ${
                canClaim && !isClaiming
                  ? "bg-cyan-500/15 text-cyan-50"
                  : "bg-transparent text-slate-500 cursor-not-allowed"
              }`}
            >
              {/* Active glow */}
              {canClaim && !isClaiming && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/15 to-transparent" />
              )}

              {canClaim && !isClaiming ? (
                <>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300/80 z-10">
                    Claim
                  </span>
                  <div className="flex items-center gap-1.5 z-10">
                    <span className="text-lg font-black text-white">
                      {displayReward}
                    </span>
                    <img
                      src={
                        rewardType === EMinerRewardType.STONE
                          ? "/stone.svg"
                          : "/dust.svg"
                      }
                      className="w-7 h-7"
                      alt=""
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center z-10 opacity-50">
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                    {isClaiming ? "Claiming" : "Mining"}
                  </span>
                  <div className="flex gap-1">
                    {[0, 0.15, 0.3].map((delay) => (
                      <div
                        key={delay}
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);
