import { AnimatePresence, motion } from "framer-motion";
import { IMinerDetail } from "../../types";
import { Lock } from "lucide-react";
import { memo } from "react";

interface MinerDisplayProps {
  selectedMiner: IMinerDetail;
  currentUserMinerLevel: number;
  minerImage?: string;
}

export const MinerDisplay = memo(
  ({ selectedMiner, currentUserMinerLevel, minerImage }: MinerDisplayProps) => {
    const level = parseInt(selectedMiner._id.split("_")[1]);
    const isLocked = level > currentUserMinerLevel;
    const imageSrc = minerImage || `/assets/miners/miner-level-${level}.svg`;
    const profit = selectedMiner.profit_per_hour;
    const rewardType = selectedMiner.reward_type;

    return (
      <div className="relative flex flex-col items-center justify-center h-[45vh] w-full mt-2">
        {/* MIDDLE: MINER IMAGE */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMiner._id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full h-full flex items-center justify-center pt-10"
          >
            <img
              src={imageSrc}
              alt={`Miner Level ${level}`}
              className={`max-w-[90%] max-h-[150%] object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.6)] transition-all duration-300 ${
                isLocked ? "opacity-30" : ""
              }`}
              style={{ imageRendering: "crisp-edges" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/miners/miner-level-1.svg";
              }}
            />

            {/* Lock Icon */}
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pt-10">
                <div className="bg-black/80 backdrop-blur-xl p-5 rounded-full border border-white/10 shadow-2xl">
                  <Lock className="w-8 h-8 text-white/90" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* BOTTOM: LEVEL BADGE (Z-Index 30) */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 opacity-95">
          <div
            className={`px-6 py-2 rounded-2xl flex items-center gap-3 border shadow-xl backdrop-blur-md ${
              isLocked
                ? "bg-gray-900/90 border-gray-700 text-gray-400"
                : "bg-cyan-950/80 border-cyan-500/50 text-cyan-50 shadow-cyan-500/20"
            }`}
          >
            <span className="text-lg uppercase font-bold opacity-90">
              Level
            </span>
            <span
              className={`text-2xl font-black ${
                isLocked ? "text-gray-500" : "text-cyan-400"
              }`}
            >
              {level}
            </span>
          </div>
        </div>

        {/* BOTTOM: PROFIT DISPLAY (Z-Index 25) - Moved & Restyled */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-25 opacity-90">
          <div
            className={`px-4 py-1 rounded-xl flex items-center gap-2 border shadow-xl backdrop-blur-md ${
              isLocked
                ? "bg-gray-800/80 border-gray-600 text-gray-400"
                : "bg-amber-950/70 border-amber-500/50 text-amber-50 shadow-amber-500/20"
            }`}
          >
            <span className="text-xl font-black font-mono drop-shadow-lg">
              +{profit}
            </span>
            <img
              src={rewardType === "STONE" ? "/stone.svg" : "/dust.svg"}
              alt="Reward"
              className="w-7 h-7 drop-shadow-md"
            />
            <span className="text-xs font-bold self-end mb-0.5 whitespace-nowrap">
              per hour
            </span>
          </div>
        </div>
      </div>
    );
  }
);
