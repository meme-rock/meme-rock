import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Disc3 } from "lucide-react";

interface SpinWheelModalProps {
  userDust: number;
  onClose: () => void;
}

const WHEEL_PRIZES = [
  {
    id: 1,
    label: "Stone",
    color: "from-purple-500 to-purple-700",
    icon: "/stone.svg",
    value: 100,
  },
  {
    id: 2,
    label: "Dust",
    color: "from-amber-500 to-amber-700",
    icon: "/dust.svg",
    value: 50,
  },
  {
    id: 3,
    label: "Rock",
    color: "from-cyan-500 to-cyan-700",
    icon: "/rock.svg",
    value: 200,
  },
  {
    id: 4,
    label: "Stone",
    color: "from-pink-500 to-pink-700",
    icon: "/stone.svg",
    value: 150,
  },
  {
    id: 5,
    label: "Dust",
    color: "from-green-500 to-green-700",
    icon: "/dust.svg",
    value: 75,
  },
  {
    id: 6,
    label: "Rock",
    color: "from-blue-500 to-blue-700",
    icon: "/rock.svg",
    value: 300,
  },
  {
    id: 7,
    label: "Stone",
    color: "from-red-500 to-red-700",
    icon: "/stone.svg",
    value: 250,
  },
  {
    id: 8,
    label: "Dust",
    color: "from-orange-500 to-orange-700",
    icon: "/dust.svg",
    value: 100,
  },
];

export const SpinWheelModal = ({ userDust, onClose }: SpinWheelModalProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<(typeof WHEEL_PRIZES)[0] | null>(
    null
  );

  const spinCost = 100;
  const canSpin = userDust >= spinCost && !isSpinning;

  const handleSpin = () => {
    if (!canSpin) return;

    setIsSpinning(true);
    setWonPrize(null);

    const randomPrizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const prize = WHEEL_PRIZES[randomPrizeIndex];

    const segmentAngle = 360 / WHEEL_PRIZES.length;
    const prizeAngle = segmentAngle * randomPrizeIndex;
    const finalRotation =
      rotation + 360 * 5 + (360 - prizeAngle) + segmentAngle / 2;

    setRotation(finalRotation);

    // TODO: Backend API call

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prize);
    }, 4000);
  };

  const segmentAngle = 360 / WHEEL_PRIZES.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border-2 border-cyan-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4 text-center">
          LUCKY SPIN
        </h2>

        {/* Wheel container */}
        <div className="relative mb-6">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500" />
          </div>

          {/* Wheel */}
          <div className="relative w-64 h-64 mx-auto">
            <motion.div
              className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-700"
              animate={{ rotate: rotation }}
              transition={{
                duration: isSpinning ? 4 : 0,
                ease: isSpinning ? [0.25, 0.1, 0.25, 1] : "linear",
              }}
            >
              {WHEEL_PRIZES.map((prize, index) => {
                const rot = segmentAngle * index;
                const x1 = 50;
                const y1 = 0;
                const x2 = 50 + 50 * Math.sin((segmentAngle * Math.PI) / 180);
                const y2 = 50 - 50 * Math.cos((segmentAngle * Math.PI) / 180);

                return (
                  <div
                    key={prize.id}
                    className="absolute w-full h-full origin-center"
                    style={{
                      transform: `rotate(${rot}deg)`,
                      clipPath: `polygon(50% 50%, ${x1}% ${y1}%, ${x2}% ${y2}%)`,
                    }}
                  >
                    <div
                      className={`w-full h-full bg-gradient-to-br ${prize.color}`}
                    >
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <img
                          src={prize.icon}
                          alt={prize.label}
                          className="w-6 h-6"
                        />
                        <span className="text-white text-xs font-bold mt-1">
                          {prize.value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center">
                <Disc3 className="w-6 h-6 text-cyan-400" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Prize display */}
        <AnimatePresence>
          {wonPrize && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-3 text-center"
            >
              <p className="text-cyan-400 font-bold mb-2">🎉 YOU WON!</p>
              <div className="flex items-center justify-center gap-2">
                <img
                  src={wonPrize.icon}
                  alt={wonPrize.label}
                  className="w-8 h-8"
                />
                <span className="text-white text-xl font-bold">
                  {wonPrize.value} {wonPrize.label}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin button */}
        <motion.button
          onClick={handleSpin}
          disabled={!canSpin}
          whileHover={canSpin ? { scale: 1.02 } : {}}
          whileTap={canSpin ? { scale: 0.98 } : {}}
          className={`w-full py-3 rounded-lg font-bold transition-all ${
            canSpin
              ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isSpinning
            ? "Spinning..."
            : wonPrize
            ? "Spin Again"
            : `Spin (${spinCost} Dust)`}
        </motion.button>

        <p className="text-gray-500 text-xs text-center mt-3">
          Balance: {userDust.toLocaleString()} dust
        </p>
      </motion.div>
    </motion.div>
  );
};
