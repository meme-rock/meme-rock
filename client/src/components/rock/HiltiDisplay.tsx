import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
import { IHiltiDetail } from "../../types";
import { formatInteger } from "../../utils/formatNumber";

interface HiltiDisplayProps {
  selectedHilti: IHiltiDetail;
  currentUserHiltiLevel: number;
  userProfitPerHour: number;
  hiltiImage?: string;
}

export const HiltiDisplay = ({
  selectedHilti,
  currentUserHiltiLevel,
  userProfitPerHour,
  hiltiImage,
}: HiltiDisplayProps) => {
  const level = parseInt(selectedHilti._id.split("_")[1]);
  const isLocked = level > currentUserHiltiLevel;
  const isCurrentLevel = level === currentUserHiltiLevel;
  const imageSrc = hiltiImage || `/assets/hiltis/hilti-level-${level}.svg`;
  const totalIncome = selectedHilti.profit_per_hour + userProfitPerHour;

  return (
    <div className="relative flex flex-col items-center mb-3">
      {/* Hilti container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedHilti._id}
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

          {/* Hilti image */}
          <img
            src={imageSrc}
            alt={`Hilti Level ${level}`}
            className={`w-80 h-80 object-contain transition-all ${
              isLocked ? "opacity-30" : ""
            }`}
            style={{ imageRendering: "crisp-edges" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/hiltis/hilti-level-1.svg";
            }}
          />

          {/* Level badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full border-2 shadow-lg ${
              isCurrentLevel
                ? "bg-gradient-to-r from-cyan-600 to-cyan-500 border-cyan-400 shadow-cyan-500/50"
                : isLocked
                ? "bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500 shadow-gray-500/30"
                : "bg-gradient-to-r from-purple-600 to-purple-500 border-purple-400 shadow-purple-500/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">LEVEL</span>
                <span className="text-black font-black text-xl">{level}</span>
              </div>

              {/* Total Hourly Income */}
              <div className="flex items-center gap-1.5 border-l-2 border-cyan-300 pl-4">
                <img
                  src="/rock.svg"
                  alt="Rock"
                  className="w-5 h-5 object-contain drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]"
                />
                <span className="text-white font-bold text-sm">
                  +{formatInteger(totalIncome)}/h
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Income Breakdown */}
      <motion.div
        key={`income-${selectedHilti._id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex gap-4 items-center"
      >
        {/* Jackhammer Income */}
        <div
          className={`px-4 py-2 rounded-lg border ${
            isLocked
              ? "bg-gradient-to-r from-gray-900/40 to-gray-800/40 border-gray-600/50"
              : "bg-gradient-to-r from-cyan-900/40 to-cyan-800/40 border-cyan-600/50"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className={`text-xs font-medium ${
                isLocked ? "text-gray-400" : "text-cyan-400"
              }`}
            >
              Jackhammer
            </span>
            <div className="flex items-center gap-1.5">
              <img
                src="/rock.svg"
                alt="Rock"
                className="w-4 h-4 object-contain drop-shadow-[0_0_3px_rgba(168,85,247,0.6)]"
              />
              <span className="text-white font-bold text-sm">
                +{formatInteger(selectedHilti.profit_per_hour)}/h
              </span>
            </div>
          </div>
        </div>

        {/* User Profit Per Hour */}
        <div
          className={`px-4 py-2 rounded-lg border ${
            isLocked
              ? "bg-gradient-to-r from-gray-900/40 to-gray-800/40 border-gray-600/50"
              : "bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 border-yellow-600/50"
          }`}
        >
          <div className="flex flex-col items-center gap-1">
            <span
              className={`text-xs font-medium ${
                isLocked ? "text-gray-400" : "text-yellow-400"
              }`}
            >
              Boosters
            </span>
            <div className="flex items-center gap-1.5">
              <img
                src="/rock.svg"
                alt="Rock"
                className="w-4 h-4 object-contain drop-shadow-[0_0_3px_rgba(168,85,247,0.6)]"
              />
              <span className="text-white font-bold text-sm">
                +{formatInteger(userProfitPerHour)}/h
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
