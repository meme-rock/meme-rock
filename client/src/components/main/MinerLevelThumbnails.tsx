import { motion } from "framer-motion";

interface MinerLevel {
  level: number;
  image: string;
  locked: boolean;
}

interface MinerLevelThumbnailsProps {
  currentLevel: number;
  maxLevel?: number;
}

export const MinerLevelThumbnails = ({
  currentLevel,
  maxLevel = 5,
}: MinerLevelThumbnailsProps) => {
  const levels: MinerLevel[] = Array.from({ length: maxLevel }, (_, i) => ({
    level: i + 1,
    image: `/miner-level-${i + 1}.png`,
    locked: i + 1 > currentLevel,
  }));

  return (
    <div className="flex items-center justify-center gap-3">
      {levels.map((levelData, index) => (
        <motion.div
          key={levelData.level}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              levelData.level === currentLevel
                ? "border-cyan-400 shadow-lg shadow-cyan-500/50 scale-110"
                : levelData.locked
                ? "border-gray-700 opacity-40"
                : "border-gray-600 opacity-70 hover:opacity-100"
            }`}
          >
            <div className="relative w-full h-full bg-gray-900">
              <img
                src={levelData.image}
                alt={`Level ${levelData.level}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  (e.target as HTMLImageElement).src = "/miner-level-1.png";
                }}
              />
              {levelData.locked && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
          {/* Level number badge */}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              levelData.level === currentLevel
                ? "bg-cyan-500 text-black"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {levelData.level}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
