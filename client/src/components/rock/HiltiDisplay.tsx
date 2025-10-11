import { motion } from "framer-motion";

interface HiltiDisplayProps {
  level: number;
  rockIncome: number;
  hiltiImage?: string;
}

export const HiltiDisplay = ({
  level,
  rockIncome,
  hiltiImage,
}: HiltiDisplayProps) => {
  const imageSrc = hiltiImage || `/assets/hiltis/hilti-level-${level}.svg`;

  return (
    <div className="relative flex flex-col items-center mb-3">
      {/* Hilti container */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative"
      >
        {/* Hilti image - tight fit for transparent background */}
        <img
          src={imageSrc}
          alt={`Hilti Level ${level}`}
          className="w-80 h-80 object-contain"
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
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-2 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-500/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">LEVEL</span>
              <span className="text-black font-black text-xl">{level}</span>
            </div>

            {/* Hourly Income */}
            <div className="flex items-center gap-1.5 border-l-2 border-cyan-300 pl-4">
              <img
                src="/rock.svg"
                alt="Rock"
                className="w-5 h-5 object-contain drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]"
              />
              <span className="text-white font-bold text-sm">
                +{rockIncome.toLocaleString()}/h
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
