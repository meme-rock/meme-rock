import { motion } from "framer-motion";
import { Disc3 } from "lucide-react";

interface SpinWheelButtonProps {
  userDust: number;
  onClick: () => void;
}

export const SpinWheelButton = ({
  userDust,
  onClick,
}: SpinWheelButtonProps) => {
  const spinCost = 100;
  const canSpin = userDust >= spinCost;

  return (
    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-5">
      <motion.button
        onClick={onClick}
        disabled={!canSpin}
        whileHover={canSpin ? { scale: 1.02 } : {}}
        whileTap={canSpin ? { scale: 0.98 } : {}}
        className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
          canSpin
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30"
            : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        <Disc3 className="w-5 h-5" />
        {canSpin ? "Spin Wheel" : `Need ${spinCost - userDust} more`}
      </motion.button>

      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-gray-400 text-sm">Cost:</span>
        <img src="/dust.svg" alt="Dust" className="w-5 h-5" />
        <span className="text-cyan-400 font-bold">{spinCost}</span>
      </div>
    </div>
  );
};
