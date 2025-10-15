import { motion } from "framer-motion";

interface HiltiLevel {
  level: number;
  image: string;
  locked: boolean;
}

interface HiltiLevelThumbnailsProps {
  currentLevel: number;
  selectedLevel: number;
  maxLevel?: number;
  onLevelSelect: (level: number) => void;
}

export const HiltiLevelThumbnails = ({
  currentLevel,
  selectedLevel,
  maxLevel = 5,
  onLevelSelect,
}: HiltiLevelThumbnailsProps) => {
  const levels: HiltiLevel[] = Array.from({ length: maxLevel }, (_, i) => ({
    level: i + 1,
    image: `/assets/hiltis/hilti-level-${i + 1}.svg`,
    locked: i + 1 > currentLevel,
  }));

  return (
    <div className="flex items-center justify-center gap-3">
      {levels.map((levelData, index) => (
        <motion.button
          key={levelData.level}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onLevelSelect(levelData.level)}
          className="relative focus:outline-none"
        >
          <div
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              levelData.level === selectedLevel
                ? "border-cyan-400 shadow-lg shadow-cyan-500/50 scale-110"
                : levelData.level === currentLevel
                ? "border-green-400 shadow-lg shadow-green-500/50"
                : levelData.locked
                ? "border-gray-700 opacity-40 cursor-default"
                : "border-gray-600 opacity-70 hover:opacity-100 hover:border-purple-500"
            }`}
          >
            <div className="relative w-full h-full bg-gray-900">
              <img
                src={levelData.image}
                alt={`Level ${levelData.level}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  (e.target as HTMLImageElement).src =
                    "assets/hiltis/hilti-level-1.svg";
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
              {/* Selected indicator */}
              {levelData.level === selectedLevel && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-3 h-3 bg-cyan-400 rounded-full border border-white"
                />
              )}
            </div>
          </div>
          {/* Level number badge */}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              levelData.level === selectedLevel
                ? "bg-cyan-500 text-black"
                : levelData.level === currentLevel
                ? "bg-green-500 text-black"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {levelData.level}
          </div>
        </motion.button>
      ))}
    </div>
  );
};
