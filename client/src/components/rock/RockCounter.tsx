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

  const user = useSelector((state: RootState) => state.user);
  const hilti_data = useSelector((state: RootState) => state.hilti);

  const fontSizeClass = useMemo(
    () => getResponsiveFontSize(displayRocks),
    [displayRocks]
  );

  const totalProfitPerHour = useMemo(() => {
    const userProfit = user.airdrop_data?.profit_per_hour || 0;
    const hiltiProfit =
      typeof hilti_data.current_hilti === "object" &&
      hilti_data.current_hilti !== null
        ? (hilti_data.current_hilti as any).profit_per_hour || 0
        : 0;
    return userProfit + hiltiProfit;
  }, [user.airdrop_data?.profit_per_hour, hilti_data.current_hilti]);

  return (
    <div className="relative w-full px-2">
      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl animate-pulse" />

        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

          {/* Content */}
          <div className="px-6 py-8">
            {/* Rock Display */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Animated Rock Icon */}
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative flex-shrink-0"
              >
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
                <img
                  src="/rock.svg"
                  alt="Rock"
                  className="relative w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                />
              </motion.div>

              {/* Number Display */}
              <div className="flex flex-col items-center">
                <div className="h-14 flex items-center justify-center">
                  <AnimatedNumber
                    value={displayRocks}
                    decimals={2}
                    className={`text-white ${fontSizeClass} font-black tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] whitespace-nowrap bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent`}
                  />
                </div>
                <div className="text-purple-300/50 text-xs font-medium uppercase tracking-widest mt-1">
                  ROCKS
                </div>
              </div>
            </div>

            {/* Profit Per Hour section */}

            <div className="flex items-center justify-center gap-2 pt-4 border-t border-purple-500/10">
              <span className="text-xs text-slate-400">Profit/Hour:</span>

              <div className="flex items-center gap-1">
                <img
                  src="/rock.svg"
                  alt="Rock"
                  className="w-5 h-5 object-contain drop-shadow-[0_0_3px_rgba(168,85,247,0.6)]"
                />
                <span className="text-cyan-400 font-bold text-sm">
                  +{totalProfitPerHour.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-3 left-3 w-3 h-3 border-l-2 border-t-2 border-purple-400/40 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-3 h-3 border-r-2 border-t-2 border-purple-400/40 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-l-2 border-b-2 border-purple-400/40 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-r-2 border-b-2 border-purple-400/40 rounded-br-lg" />
        </div>
      </motion.div>
    </div>
  );
};
