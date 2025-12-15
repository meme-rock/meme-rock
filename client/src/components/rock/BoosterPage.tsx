import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { BoosterCard } from "./BoosterCard";
import { useSelector, shallowEqual } from "react-redux";
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
  const boosters = useSelector(
    (state: RootState) => state.booster,
    shallowEqual
  );

  // Filter boosters based on selected level
  const filteredBoosters = useMemo(() => {
    return boosters.filter((booster) => {
      const requiredLevel = parseInt(
        booster.required_hilti_level.split("_")[1] || "1"
      );
      return requiredLevel === selectedLevel;
    });
  }, [boosters, selectedLevel]);

  // Check if selected level is locked
  const isLevelLocked = selectedLevel > currentHiltiLevel;

  // Level selector data
  const levels = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-20">
      {/* Background effects - Mine Sayfası ile Tutarlı */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-cyan-900/20 to-transparent" />
        <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 py-4 max-w-lg">
        {/* Header with back button - Sadeleştirildi */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold flex items-center gap-2 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
            <span>Back</span>
          </button>

          <h1 className="text-2xl font-bold text-white">Boosters</h1>
          {/* Empty div for spacing */}
          <div className="w-24"></div>
        </div>

        {/* Hilti Level Selector - HiltiLevelThumbnails UI Mantığı Kullanıldı */}
        <div className="w-full overflow-x-auto no-scrollbar py-2 mb-6">
          <div className="flex items-center justify-center gap-4 px-4">
            {levels.map((level, index) => {
              const locked = level > currentHiltiLevel;
              return (
                <motion.button
                  key={level}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedLevel(level)}
                  className="relative group focus:outline-none"
                >
                  <div
                    className={`relative w-14 h-14 rounded-2xl border transition-all duration-300 flex items-center justify-center overflow-hidden ${
                      level === selectedLevel
                        ? "border-cyan-400 bg-cyan-900/30 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110"
                        : level === currentHiltiLevel
                        ? "border-green-500/60 bg-green-900/20"
                        : "border-white/10 bg-white/5 opacity-50"
                    }`}
                  >
                    <img
                      src={`/assets/hiltis/hilti-level-${level}.svg`}
                      alt={`Level ${level}`}
                      className={`w-full h-full object-cover transition-opacity ${
                        locked ? "opacity-40 grayscale" : "opacity-100"
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/hiltis/hilti-level-1.svg";
                      }}
                    />

                    {/* Lock Overlay */}
                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Lock className="w-4 h-4 text-white/60" />
                      </div>
                    )}
                  </div>

                  {/* Active Indicator Dot */}
                  {level === selectedLevel && (
                    <motion.div
                      layoutId="boosterActiveTab"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Level title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-white">
              Level {selectedLevel} Boosters
            </h2>
          </div>
          {isLevelLocked ? (
            <div className="mt-3 bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 max-w-md mx-auto">
              <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-red-400" />
                Unlocks at Level {selectedLevel} Jackhammer
              </p>
            </div>
          ) : (
            selectedLevel === currentHiltiLevel && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                <p className="text-sm text-cyan-400 font-medium">
                  Your Current Level
                </p>
              </div>
            )
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
