import { motion } from "framer-motion";
import { Pickaxe, Clock } from "lucide-react";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { useMineDailyStoneRewardMutation } from "../../redux/services/user/user-api";
import WebApp from "@twa-dev/sdk";
import { memo, useState, useEffect, useMemo } from "react";

interface MineButtonProps {
  reward: number;
  disabled?: boolean;
  showButton?: boolean;
}

export const MineButton = memo(
  ({ reward, disabled = false, showButton = true }: MineButtonProps) => {
    // Only select user._id and miner_data to avoid re-renders from displayRocks updates
    const userId = useSelector((state: RootState) => state.user._id);
    const minerData = useSelector(
      (state: RootState) => state.user.miner_data,
      shallowEqual
    );

    const [mineDailyStoneReward] = useMineDailyStoneRewardMutation();
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update current time every second for countdown
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    // Calculate remaining time until next mine (24 hours after last_mine)
    const { isOnCooldown, remainingHours, remainingMinutes } = useMemo(() => {
      const lastMineTime = new Date(minerData.last_mine).getTime();
      const nextAvailableTime = lastMineTime + 24 * 60 * 60 * 1000; // 24 hours later
      const remaining = nextAvailableTime - currentTime;

      if (remaining <= 0) {
        return { isOnCooldown: false, remainingHours: 0, remainingMinutes: 0 };
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        isOnCooldown: true,
        remainingHours: hours,
        remainingMinutes: minutes,
      };
    }, [minerData.last_mine, currentTime]);

    const isDisabled = disabled || isOnCooldown;

    const handleMine = async () => {
      try {
        await mineDailyStoneReward({
          user_id: userId,
        }).unwrap();
      } catch (error: any) {
        console.error("❌ Error mining daily stone reward:", error);

        // Handle different error types
        let errorMessage =
          "Failed to mine daily stone reward. Please try again.";

        if (error?.data) {
          // Backend returned structured error
          if (error.data.message === "USER_NOT_FOUND") {
            errorMessage = "User not found. Please restart the app.";
          } else if (error.data.message === "MINER_REWARD_NOT_READY_YET") {
            // Calculate remaining time
            if (error.data.next_available_at) {
              const nextTime = new Date(error.data.next_available_at);
              const now = new Date();
              const diff = Math.max(0, nextTime.getTime() - now.getTime());
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor(
                (diff % (1000 * 60 * 60)) / (1000 * 60)
              );

              errorMessage = `⏰ Please wait ${hours}h ${minutes}m before mining again.`;
            } else {
              errorMessage =
                "⏰ Mining reward not ready yet. Please wait 24 hours between claims.";
            }
          } else if (error.data.message === "UNEXPECTED_SERVER_ERROR") {
            errorMessage = "Server error occurred. Please try again later.";
          } else if (typeof error.data.message === "string") {
            errorMessage = error.data.message;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }

        WebApp.showAlert(errorMessage);
      }
    };

    return (
      <div className="flex flex-col items-center gap-4">
        {/* Reward display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 bg-gray-800/50 px-6 py-2 rounded-full border border-gray-700"
        >
          <img src="/stone.svg" alt="Stone" className="w-6 h-6" />
          <span className="text-white font-bold text-lg">{reward} Stone</span>
        </motion.div>
        {/* Mine Button - only show if showButton is true */}
        {showButton && (
          <motion.button
            onClick={handleMine}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.05 } : {}}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
            className={`relative group ${
              isDisabled ? "cursor-not-allowed" : ""
            }`}
          >
            {/* Glow effect */}
            <div
              className={`absolute inset-0 rounded-2xl blur-xl transition-opacity ${
                isDisabled
                  ? "bg-gray-600/20 opacity-50"
                  : "bg-cyan-500/50 group-hover:bg-cyan-400/70"
              }`}
            />

            {/* Button container */}
            <div
              className={`relative px-8 py-4 rounded-2xl border-4 transition-all duration-300 ${
                isDisabled
                  ? "border-gray-700 bg-gray-800"
                  : "border-cyan-400 bg-gradient-to-b from-gray-900 to-gray-800 group-hover:border-cyan-300 group-hover:shadow-lg group-hover:shadow-cyan-500/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <img src="/stone.svg" alt="Stone" className="w-12 h-12" />
                <div className="flex flex-col items-start flex-1">
                  <span
                    className={`text-xl font-bold tracking-wide ${
                      isDisabled ? "text-gray-500" : "text-cyan-400"
                    }`}
                  >
                    {isOnCooldown ? "ON COOLDOWN" : "MINE DAILY STONE"}
                  </span>
                  {isOnCooldown && (
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-base font-semibold text-orange-400">
                        {remainingHours > 0 && `${remainingHours}h `}
                        {remainingMinutes}m
                      </span>
                    </div>
                  )}
                </div>
                {!isDisabled && <Pickaxe className="w-6 h-6 text-cyan-400" />}
                {isDisabled && <Clock className="w-6 h-6 text-gray-500" />}
              </div>
            </div>

            {/* Animated particles on hover */}
            {!isDisabled && (
              <>
                <motion.div
                  className="absolute top-0 left-1/4 w-1 h-1 bg-cyan-400 rounded-full"
                  animate={{
                    y: [-20, -40],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0,
                  }}
                />
                <motion.div
                  className="absolute top-0 right-1/4 w-1 h-1 bg-cyan-400 rounded-full"
                  animate={{
                    y: [-20, -40],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                />
              </>
            )}
          </motion.button>
        )}
      </div>
    );
  }
);
