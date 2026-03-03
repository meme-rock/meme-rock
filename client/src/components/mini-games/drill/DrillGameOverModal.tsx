import { motion } from "framer-motion";
import { MAX_ADS_PER_DAY } from "./drillTypes";

interface DrillGameOverModalProps {
  adsWatchedToday: number;
  onWatchAd: () => void;
  onBack: () => void;
  isAdLoading: boolean;
}

export const DrillGameOverModal = ({
  adsWatchedToday,
  onWatchAd,
  onBack,
  isAdLoading,
}: DrillGameOverModalProps) => {
  const adsRemaining = MAX_ADS_PER_DAY - adsWatchedToday;
  const canWatchAd = adsRemaining > 0;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative z-10 w-[85%] max-w-[340px] rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{
          background: "linear-gradient(180deg, #1a2540 0%, #0e1525 100%)",
          border: "2px solid #3a7bd5",
          boxShadow: "0 0 40px rgba(58,123,213,0.3)",
        }}
      >
        {/* Title */}
        <div
          className="text-center"
          style={{
            fontFamily: "Bungee, cursive",
            fontSize: "28px",
            color: "#ff6b6b",
            textShadow: "0 0 15px rgba(255,107,107,0.4)",
          }}
        >
          No More Rocks!
        </div>

        {/* Subtitle */}
        <p
          className="text-center text-sm"
          style={{ color: "#8ab4f0", fontFamily: "Outfit, sans-serif" }}
        >
          {canWatchAd
            ? "Watch an ad to get more rocks and keep drilling!"
            : "Come back tomorrow for more rocks!"}
        </p>

        {/* Ad button */}
        {canWatchAd && (
          <button
            onClick={onWatchAd}
            disabled={isAdLoading}
            className="w-full py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #3a7bd5 0%, #2a5aaa 100%)",
              border: "2px solid #5a9bf5",
              boxShadow: "0 0 20px rgba(58,123,213,0.4)",
              fontFamily: "Bungee, cursive",
              fontSize: "16px",
              color: "#fff",
            }}
          >
            {isAdLoading ? "Loading..." : "Watch Ad (+5 Rocks)"}
          </button>
        )}

        {/* Remaining ads */}
        {canWatchAd && (
          <span
            className="text-xs"
            style={{ color: "#5a7a9f", fontFamily: "Outfit, sans-serif" }}
          >
            {adsRemaining} ad{adsRemaining !== 1 ? "s" : ""} remaining today
          </span>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-full py-2.5 rounded-xl transition-all active:scale-95"
          style={{
            background: "rgba(30,42,70,0.6)",
            border: "2px solid #3a5a80",
            fontFamily: "Bungee, cursive",
            fontSize: "14px",
            color: "#8ab4f0",
          }}
        >
          Back to Menu
        </button>
      </motion.div>
    </div>
  );
};
