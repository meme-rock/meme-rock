import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { BoosterCard } from "./BoosterCard";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface BoosterPageProps {
  currentHiltiLevel: number;
  onClose: () => void;
}

export const BoosterPage = ({
  currentHiltiLevel,
  onClose,
}: BoosterPageProps) => {
  const [selectedLevel, setSelectedLevel] = useState(currentHiltiLevel);
  const boosters = useSelector((state: RootState) => state.booster);

  // Filter boosters based on selected level
  const filteredBoosters = boosters.filter((booster) => {
    const requiredLevel = parseInt(
      booster.required_hilti_level.split("_")[1] || "1"
    );
    return requiredLevel === selectedLevel;
  });

  // Check if selected level is locked
  const isLevelLocked = selectedLevel > currentHiltiLevel;

  // Level selector
  const levels = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

      {/* Content container */}
      <div className="relative container mx-auto px-4 py-4">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </button>

          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Boosters
          </h1>

          {/* Empty div for spacing */}
          <div className="w-24"></div>
        </div>

        {/* Hilti Level Selector - Rock Page Style */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3">
            {levels.map((level, index) => (
              <motion.button
                key={level}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedLevel(level)}
                className="relative"
              >
                <div
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    level === selectedLevel
                      ? "border-cyan-400 shadow-lg shadow-cyan-500/50 scale-110"
                      : level > currentHiltiLevel
                      ? "border-gray-700 opacity-40 hover:opacity-60"
                      : "border-gray-600 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="relative w-full h-full bg-gray-900">
                    <img
                      src={`/assets/hiltis/hilti-level-${level}.svg`}
                      alt={`Level ${level}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/hiltis/hilti-level-1.svg";
                      }}
                    />
                    {level > currentHiltiLevel && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Level number badge */}
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    level === selectedLevel
                      ? "bg-cyan-500 text-black"
                      : level === currentHiltiLevel
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {level}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Level title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Level {selectedLevel} Boosters
            </h2>
            {isLevelLocked && <Lock className="w-5 h-5 text-yellow-500" />}
          </div>
          {isLevelLocked && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 max-w-md mx-auto">
              <p className="text-sm text-yellow-400 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Unlocks at Level {selectedLevel} Jackhammer
              </p>
            </div>
          )}
          {!isLevelLocked && selectedLevel !== currentHiltiLevel && (
            <p className="text-sm text-gray-400 mt-2">
              Available boosters at Level {selectedLevel}
            </p>
          )}
          {selectedLevel === currentHiltiLevel && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
              <p className="text-sm text-cyan-400 font-medium">
                Your Current Level
              </p>
            </div>
          )}
        </div>

        {/* Boosters list */}
        <div className="space-y-4">
          {filteredBoosters.length > 0 ? (
            filteredBoosters.map((booster, index) => (
              <motion.div
                key={booster._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BoosterCard booster={booster} isLevelLocked={isLevelLocked} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No boosters available for this level
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
