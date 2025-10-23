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
    const isCurrentLevel = level === currentUserMinerLevel;
    const imageSrc = minerImage || `/assets/miners/miner-level-${level}.svg`;

    return (
      <div className="relative flex flex-col items-center mb-3">
        {/* Miner container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMiner._id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="relative"
          >
            {/* Lock Overlay for locked hiltis */}
            {isLocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-2xl z-10 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <Lock className="w-16 h-16 text-gray-400" />
                </div>
              </motion.div>
            )}

            {/* Current Level Badge */}
            {isCurrentLevel && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 shadow-lg"
              >
                CURRENT
              </motion.div>
            )}
            {/* Miner image - tight fit for transparent background */}
            <img
              src={imageSrc}
              alt={`Miner Level ${level}`}
              className={`w-80 h-80 object-contain transition-all ${
                isLocked ? "opacity-30" : ""
              }`}
              style={{ imageRendering: "crisp-edges" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/assets/miners/miner-level-1.svg";
              }}
            />

            {/* Level badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-2 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-500/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">LEVEL</span>
                <span className="text-black font-black text-xl">{level}</span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
);
