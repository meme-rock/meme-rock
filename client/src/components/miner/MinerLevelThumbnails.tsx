import { motion } from "framer-motion";
import { memo } from "react";

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
      <div className="w-full overflow-x-auto no-scrollbar py-2">
        <div className="flex items-center justify-center gap-4 px-4">
          {levels.map((levelData, index) => (
            <motion.button
              key={levelData.level}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onLevelSelect(levelData.level)}
              className="relative group focus:outline-none"
            >
              <div
                className={`relative w-14 h-14 rounded-2xl border transition-all duration-300 flex items-center justify-center overflow-hidden ${
                  levelData.level === selectedLevel
                    ? "border-cyan-400 bg-cyan-900/30 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110"
                    : levelData.level === currentLevel
                    ? "border-green-500/60 bg-green-900/20"
                    : "border-white/10 bg-white/5 opacity-50"
                }`}
              >
                <img
                  src={levelData.image}
                  alt={`Level ${levelData.level}`}
                  className={`w-full h-full object-cover transition-opacity ${
                    levelData.locked ? "opacity-40 grayscale" : "opacity-100"
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "assets/miners/miner-LEVEL_1.svg";
                  }}
                />

                {/* Lock Overlay */}
                {levelData.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <svg
                      className="w-4 h-4 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Active Indicator Dot */}
              {levelData.level === selectedLevel && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }
);
