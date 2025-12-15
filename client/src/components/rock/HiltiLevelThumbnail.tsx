import { motion } from "framer-motion";
import { memo } from "react";
import { Lock } from "lucide-react";

interface HiltiLevel {
  level: number;
  image: string;
  locked: boolean;
}

interface HiltiLevelThumbnailsProps {
  currentLevel: number;
  selectedLevel: number;
  minLevel?: number;
  maxLevel?: number;
  onLevelSelect: (level: number) => void;
}

export const HiltiLevelThumbnails = memo(
  ({
    currentLevel,
    selectedLevel,
    minLevel = 1,
    maxLevel = 5,
    onLevelSelect,
  }: HiltiLevelThumbnailsProps) => {
    const levels: HiltiLevel[] = Array.from(
      { length: maxLevel - minLevel + 1 },
      (_, i) => {
        const level = minLevel + i;
        return {
          level,
          image: `/assets/hiltis/hilti-level-${level}.svg`,
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
                      "assets/hiltis/hilti-level-1.svg";
                  }}
                />

                {/* Lock Overlay */}
                {levelData.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Lock className="w-4 h-4 text-white/60" />
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
