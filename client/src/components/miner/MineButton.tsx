import { motion } from "framer-motion";
import { Pickaxe } from "lucide-react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { useMineMutation } from "../../redux/services/user/user-api";
import WebApp from "@twa-dev/sdk";
import { memo, useState, useEffect, useMemo, useRef } from "react";
import { EMinerRewardType } from "../../types/enums";

interface MiningProgressProps {
  hourlyReward: number;
  showProgress?: boolean;
  rewardType: EMinerRewardType;
}

export const MineButton = memo(
  ({ hourlyReward, rewardType, showProgress = true }: MiningProgressProps) => {
    const userId = useSelector((state: RootState) => state.user._id);
    const minerData = useSelector(
      (state: RootState) => state.user.miner_data,
      shallowEqual
    );
    console.log("minerData", minerData);

    const [mine] = useMineMutation();
    const [currentTime, setCurrentTime] = useState(Date.now());
    const hasAutoClaimedRef = useRef(false);

    // Update current time every second for countdown
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    // Calculate mining progress (1 hour = 60 minutes)
    const { progressPercentage, remainingMinutes, canClaim } = useMemo(() => {
      const lastMineTime = new Date(minerData.last_mine).getTime();
      const oneHourInMs = 60 * 60 * 1000; // 1 hour
      const nextClaimTime = lastMineTime + oneHourInMs;
      const elapsed = currentTime - lastMineTime;
      const remaining = nextClaimTime - currentTime;

      // If more than 1 hour passed, mining is complete
      if (remaining <= 0) {
        return {
          progressPercentage: 100,
          remainingMinutes: 0,
          canClaim: true,
        };
      }

      // Calculate progress (0-100%)
      const progress = (elapsed / oneHourInMs) * 100;

      // Calculate remaining time (only minutes)
      const minutes = Math.floor(remaining / (1000 * 60));

      return {
        progressPercentage: Math.min(progress, 100),
        remainingMinutes: minutes,
        canClaim: false,
      };
    }, [minerData.last_mine, currentTime]);

    // Auto-claim when mining is complete
    useEffect(() => {
      const attemptAutoClaim = async () => {
        if (canClaim && !hasAutoClaimedRef.current) {
          hasAutoClaimedRef.current = true;

          try {
            const result = await mine({ user_id: userId }).unwrap();
            console.log("✅ Auto-claimed mining reward!", result);

            // Reset auto-claim flag after successful claim
            setTimeout(() => {
              hasAutoClaimedRef.current = false;
            }, 2000);
          } catch (error: any) {
            console.error("❌ Auto-claim failed:", error);

            // Reset flag to retry on next cycle
            hasAutoClaimedRef.current = false;

            // Show error to user only if it's not a "NOT_READY" error
            if (error?.data?.message !== "MINER_REWARD_NOT_READY_YET") {
              const errorMessage =
                error?.data?.message || "Failed to claim mining reward";
              WebApp.showAlert(errorMessage);
            }
          }
        }
      };

      attemptAutoClaim();
    }, [canClaim, userId, mine]);

    return (
      <div className="flex flex-col items-center gap-6 w-full px-4">
        {/* Hourly reward display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-8 py-3 rounded-2xl backdrop-blur-sm"
        >
          <img
            src={
              rewardType === EMinerRewardType.STONE ? `stone.svg` : `dust.svg`
            }
            alt="Stone"
            className="w-12 h-12"
          />
          <div className="flex flex-col items-start">
            <span className="text-cyan-400 text-xs font-medium">
              Profit Per Hour
            </span>
            <span className="text-white font-bold text-xl">
              + {hourlyReward}
            </span>
          </div>
        </motion.div>

        {/* Mining Progress Display */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md space-y-4"
          >
            {/* Header with icon */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: canClaim ? 0 : [0, -10, 10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Pickaxe className="w-5 h-5 text-cyan-400" />
                </motion.div>
                <span className="text-gray-300 font-semibold">
                  Mining Progress
                </span>
              </div>
              <span className="text-gray-400 text-sm">
                {canClaim ? "Ready!" : `${remainingMinutes} min left`}
              </span>
            </div>

            {/* Modern Progress Bar */}
            <div className="relative">
              {/* Background glow */}
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />

              {/* Progress bar container */}
              <div className="relative h-6 bg-gray-900/80 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)",
                  }}
                >
                  {/* Glow at the end of progress */}
                  {progressPercentage > 0 && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  )}
                </motion.div>

                {/* Progress percentage inside bar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-center">
              {canClaim ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: [0.9, 1.05, 0.9] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-6 py-2.5 rounded-full backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Pickaxe className="w-4 h-4 text-green-400" />
                  </motion.div>
                  <span className="text-green-400 font-bold text-sm">
                    Collecting reward...
                  </span>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="text-gray-400 text-sm font-medium">
                    Mining in progress...
                  </span>
                </div>
              )}
            </div>

            {/* Particle effects when near completion */}
            {progressPercentage >= 75 && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: "50%",
                    }}
                    animate={{
                      y: [-20, -50],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);
