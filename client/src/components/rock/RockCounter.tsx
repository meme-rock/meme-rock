import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { AnimatedNumber } from "./AnimatedNumber";
import { useMemo } from "react";
import { getResponsiveFontSize } from "../../utils/formatNumber";

export const RockCounter = () => {
  const displayRocks = useSelector(
    (state: RootState) => state.user.displayRocks
  );

  // Get responsive font size based on number magnitude
  const fontSizeClass = useMemo(
    () => getResponsiveFontSize(displayRocks),
    [displayRocks]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center gap-3 px-4 py-4"
    >
      {/* Main Display Card - Responsive container */}
      <div className="relative bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 border-2 border-purple-500/50 rounded-2xl px-6 py-6 shadow-2xl shadow-purple-500/20">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-xl" />

        {/* Content - Fixed layout */}
        <div className="relative flex items-center justify-center gap-4">
          {/* Rock Icon - Fixed position */}
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex-shrink-0"
          >
            <img
              src="/rock.svg"
              alt="Rock"
              className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]"
            />
          </motion.div>

          {/* Number Display - Responsive container */}
          <div className="flex flex-col items-center">
            <div className="h-12 flex items-center justify-center">
              <AnimatedNumber
                value={displayRocks}
                decimals={2}
                className={`text-white ${fontSizeClass} font-black tracking-tight drop-shadow-lg whitespace-nowrap`}
              />
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-75" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: `${50 + (Math.random() - 0.5) * 80}%`,
              y: "120%",
              opacity: 0,
              scale: 0,
            }}
            animate={{
              y: ["-20%", "-120%"],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
          >
            <img
              src="/rock.svg"
              alt=""
              className="w-4 h-4 opacity-40"
              style={{
                filter: "drop-shadow(0 0 4px rgba(168, 85, 247, 0.6))",
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
