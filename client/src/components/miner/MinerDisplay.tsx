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
      <div className="relative flex flex-col items-center justify-center h-[50vh] w-full">
        {/* Ambient glow behind miner */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none">
          <div
            className={`w-full h-full rounded-full blur-[80px] transition-colors duration-500 ${
              isLocked ? "bg-slate-800/30" : "bg-cyan-600/10"
            }`}
          />
        </div>

        {/* Miner Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMiner._id}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative w-full flex-1 flex items-center justify-center"
          >
            <img
              src={imageSrc}
              alt={`Miner Level ${level}`}
              className={`max-w-[85%] max-h-[140%] object-contain transition-all duration-300 ${
                isLocked
                  ? "opacity-25 grayscale"
                  : "drop-shadow-[0_0_40px_rgba(6,182,212,0.15)]"
              }`}
              style={{ imageRendering: "crisp-edges" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/miners/miner-level-1.svg";
              }}
            />

            {/* Lock overlay */}
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-full border border-slate-700/50 shadow-2xl">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Info: Level + Profit */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          {/* Level Badge */}
          <motion.div
            key={`level-${level}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`px-5 py-2 rounded-2xl flex items-center gap-2.5 border backdrop-blur-md shadow-lg ${
              isLocked
                ? "bg-slate-900/80 border-slate-700/50 text-slate-500"
                : "bg-slate-900/70 border-cyan-500/30 text-cyan-50 shadow-cyan-500/10"
            }`}
          >
            <span className="text-xs uppercase font-bold tracking-widest opacity-70">
              Level
            </span>
            <span
              className={`text-xl font-black ${
                isLocked ? "text-slate-500" : "text-cyan-400"
              }`}
            >
              {level}
            </span>
          </motion.div>

          {/* Profit Display */}
          <motion.div
            key={`profit-${profit}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`px-4 py-1.5 rounded-xl flex items-center gap-2 border backdrop-blur-md ${
              isLocked
                ? "bg-slate-900/60 border-slate-700/30 text-slate-500"
                : "bg-slate-900/60 border-amber-500/30 text-amber-50 shadow-lg shadow-amber-500/5"
            }`}
          >
            <span className="text-lg font-black font-mono">
              +{profit}
            </span>
            <img
              src={rewardType === "STONE" ? "/stone.svg" : "/dust.svg"}
              alt="Reward"
              className="w-6 h-6"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
              /hr
            </span>
          </motion.div>
        </div>
      </div>
    );
  }
);
