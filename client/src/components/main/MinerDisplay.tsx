import { motion } from "framer-motion";

interface MinerDisplayProps {
  level: number;
  minerImage?: string;
}

export const MinerDisplay = ({ level, minerImage }: MinerDisplayProps) => {
  const imageSrc = minerImage || `/miner-level-${level}.svg`;

  return (
    <div className="relative flex flex-col items-center mb-3">
      {/* Miner character container */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative"
      >
        {/* Miner image - tight fit for transparent background */}
        <img
          src={imageSrc}
          alt={`Miner Level ${level}`}
          className="w-80 h-80 object-contain"
          style={{ imageRendering: "crisp-edges" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/rock-miner.svg";
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
    </div>
  );
};
