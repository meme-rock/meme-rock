import { useState } from "react";
import { motion } from "framer-motion";
import { StoneTodustExchange } from "../components/dust/Exchange";
import { AdRewardSection } from "../components/dust/AdRewardSection";
import { SpinWheelButton } from "../components/dust/SpinWheelButton";
import { SpinWheelModal } from "../components/dust/SpinWheelModal";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";

export const DustPage = () => {
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  // Select only balance_data to avoid re-renders from displayRocks updates
  const balanceData = useSelector(
    (state: RootState) => state.user.balance_data,
    shallowEqual
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />

      {/* Floating dust particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content container */}
      <div className="relative container mx-auto px-4 py-6 space-y-6">
        {/* Stone to Dust Exchange */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StoneTodustExchange userStones={balanceData.stone} />
        </motion.div>

        {/* Ad Reward Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AdRewardSection />
        </motion.div>

        {/* Spin Wheel Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SpinWheelButton
            userDust={balanceData.dust}
            onClick={() => setShowSpinWheel(true)}
          />
        </motion.div>
      </div>

      {/* Spin Wheel Modal */}
      {showSpinWheel && (
        <SpinWheelModal
          userDust={balanceData.dust}
          onClose={() => setShowSpinWheel(false)}
        />
      )}

      {/* Adsgram is now integrated via window.Adsgram.init() - no component needed */}
    </div>
  );
};
