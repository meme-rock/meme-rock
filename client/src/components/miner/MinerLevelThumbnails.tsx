import { motion } from "framer-motion";
import { memo } from "react";
import { Lock } from "lucide-react";

interface MinerLevel {
  level: number;
  image: string;
  locked: boolean;
}

interface MinerLevelThumbnailsProps {
  currentLevel: number;
  selectedLevel: number;
  minLevel?: number;
  maxLevel?: number;
  onLevelSelect: (level: number) => void;
}

export const MinerLevelThumbnails = memo(
  ({
    currentLevel,
    selectedLevel,
    minLevel = 1,
    maxLevel = 5,
    onLevelSelect,
  }: MinerLevelThumbnailsProps) => {
    const levels: MinerLevel[] = Array.from(
      { length: maxLevel - minLevel + 1 },
      (_, i) => {
        const level = minLevel + i;
        return {
          level,
          image: `/assets/miners/miner-level-${level}.svg`,
          locked: level > currentLevel,
        };
      }
    );

    return (
      <div className="w-full py-3 px-4">
        <div className="flex items-center justify-center gap-3">
          {levels.map((levelData, index) => {
            const isSelected = levelData.level === selectedLevel;
            const isCurrent = levelData.level === currentLevel;

            return (
              <motion.button
                key={levelData.level}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, type: "spring", stiffness: 300 }}
                onClick={() => onLevelSelect(levelData.level)}
                className="relative group focus:outline-none"
              >
                {/* Glow effect for selected */}
                {isSelected && (
                  <div className="absolute -inset-1 bg-cyan-500/20 rounded-2xl blur-md" />
                )}

                <div
                  className={`relative w-14 h-14 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center overflow-hidden ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-500/20 scale-110"
                      : isCurrent
                      ? "border-cyan-600/40 bg-slate-800/60"
                      : "border-slate-700/40 bg-slate-900/40"
                  }`}
                >
                  <img
                    src={levelData.image}
                    alt={`Level ${levelData.level}`}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      levelData.locked
                        ? "opacity-30 grayscale"
                        : isSelected
                        ? "opacity-100 scale-105"
                        : "opacity-70"
                    }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "assets/miners/miner-LEVEL_1.svg";
                    }}
                  />

                  {/* Lock overlay */}
                  {levelData.locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Level label */}
                <span
                  className={`block text-center mt-1.5 text-[10px] font-bold transition-colors duration-300 ${
                    isSelected
                      ? "text-cyan-400"
                      : isCurrent
                      ? "text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  Lv.{levelData.level}
                </span>

                {/* Active indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="minerActiveTab"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }
);
