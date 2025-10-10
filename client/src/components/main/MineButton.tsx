import { motion } from "framer-motion";
import { Pickaxe } from "lucide-react";

interface MineButtonProps {
  onMine: () => void;
  reward: number;
  disabled?: boolean;
  cooldownRemaining?: number;
}

export const MineButton = ({
  onMine,
  reward,
  disabled = false,
  cooldownRemaining = 0,
}: MineButtonProps) => {
  const isOnCooldown = cooldownRemaining > 0;
  const isDisabled = disabled || isOnCooldown;

  const formatCooldown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mine Button */}
      <motion.button
        onClick={onMine}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        className={`relative group ${isDisabled ? "cursor-not-allowed" : ""}`}
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
          className={`relative px-12 py-4 rounded-2xl border-4 transition-all duration-300 ${
            isDisabled
              ? "border-gray-700 bg-gray-800"
              : "border-cyan-400 bg-gradient-to-b from-gray-900 to-gray-800 group-hover:border-cyan-300 group-hover:shadow-lg group-hover:shadow-cyan-500/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <img src="/stone.svg" alt="Stone" className="w-12 h-12" />
            <div className="flex flex-col items-start">
              <span
                className={`text-xl font-bold tracking-wide ${
                  isDisabled ? "text-gray-500" : "text-cyan-400"
                }`}
              >
                {isOnCooldown ? "ON COOLDOWN" : "MINE DAILY STONE"}
              </span>
              {isOnCooldown && (
                <span className="text-sm text-gray-400">
                  {formatCooldown(cooldownRemaining)}
                </span>
              )}
            </div>
            {!isDisabled && <Pickaxe className="w-6 h-6 text-cyan-400" />}
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
    </div>
  );
};
