import { motion } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
import { useUnifiedAd } from "../../ad";

// Adsgram Block ID (Reward type - just the number)
// Example: "16184", "12345"
// IMPORTANT: Set this in .env file: VITE_ADSGRAM_BLOCK_ID=16184
const ADSGRAM_BLOCK_ID = import.meta.env.VITE_ADSGRAM_BLOCK_ID || "";

export const AdRewardSection = () => {
  const {
    isWatching,
    isAdReady,
    availableNetwork,
    showAd,
    adExtraReady,
    adsgramReady,
  } = useUnifiedAd(ADSGRAM_BLOCK_ID);

  const dustReward = 10;

  const handleWatchAd = async () => {
    if (isWatching || !isAdReady) return;

    console.log("📺 Starting ad...");
    const result = await showAd();

    if (result.success) {
      console.log(`✅ Ad completed via ${result.network}`);
      console.log("⏳ Waiting for webhook callback from ad provider...");
      // Reward will be added by webhook from ad provider
    } else {
      console.error("❌ Failed to show ad");
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-5">
      <motion.button
        onClick={handleWatchAd}
        disabled={!isAdReady || isWatching}
        whileHover={isAdReady && !isWatching ? { scale: 1.02 } : {}}
        whileTap={isAdReady && !isWatching ? { scale: 0.98 } : {}}
        className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
          isAdReady && !isWatching
            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30"
            : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isWatching ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-5 h-5" />
            </motion.div>
            Watching...
          </>
        ) : isAdReady ? (
          <>
            <Play className="w-5 h-5" />
            Watch Ad
          </>
        ) : (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading ad...
          </>
        )}
      </motion.button>

      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-gray-400 text-sm">Reward:</span>
        <img src="/dust.svg" alt="Dust" className="w-5 h-5" />
        <span className="text-purple-400 font-bold">{dustReward}</span>
      </div>

      {/* Ad network status indicator */}
      {availableNetwork !== "none" && (
        <div className="flex items-center justify-center gap-3 mt-2 text-xs">
          {adExtraReady && <span className="text-green-400">✓ AdExtra</span>}
          {adsgramReady && <span className="text-green-400">✓ Adsgram</span>}
        </div>
      )}
    </div>
  );
};
