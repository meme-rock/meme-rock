import { motion } from "framer-motion";
import { Play, Loader2, Tv, AlertCircle, CheckCircle } from "lucide-react";
import { useAdExtra } from "../../ad/hooks/useAdExtra";
import { useAdsgram } from "../../ad/hooks/useAdsgram";
import { useState, useEffect } from "react";

const ADSGRAM_BLOCK_ID = import.meta.env.VITE_ADSGRAM_BLOCK_ID || "";

export const AdRewardSection = () => {
  const adExtra = useAdExtra();
  const adsgram = useAdsgram(ADSGRAM_BLOCK_ID);

  const [adExtraWatching, setAdExtraWatching] = useState(false);
  const [adsgramWatching, setAdsgramWatching] = useState(false);

  const dustReward = 5;

  // Auto-clear success/error status after 5 seconds
  useEffect(() => {
    if (
      adExtra.lastAttemptStatus === "success" ||
      adExtra.lastAttemptStatus === "error"
    ) {
      const timer = setTimeout(() => {
        // Reset to idle after showing success/error
        console.log("🔄 Clearing AdExtra status");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [adExtra.lastAttemptStatus]);

  useEffect(() => {
    if (
      adsgram.lastAttemptStatus === "success" ||
      adsgram.lastAttemptStatus === "error"
    ) {
      const timer = setTimeout(() => {
        console.log("🔄 Clearing Adsgram status");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [adsgram.lastAttemptStatus]);

  // AdExtra button handler
  const handleWatchAdExtra = async () => {
    if (adExtraWatching || !adExtra.isReady) return;

    console.log("📺 User clicked AdExtra button");
    setAdExtraWatching(true);

    try {
      const result = await adExtra.showAd();

      if (result.success) {
        console.log("✅ AdExtra completed successfully");
      } else {
        console.log("⚠️ AdExtra: No ads available");
      }
    } catch (error) {
      console.error("❌ AdExtra error:", error);
    } finally {
      setAdExtraWatching(false);
    }
  };

  // Adsgram button handler
  const handleWatchAdsgram = async () => {
    if (adsgramWatching || !adsgram.isReady) return;

    console.log("📺 User clicked Adsgram button");
    setAdsgramWatching(true);

    try {
      const result = await adsgram.showAd();

      if (result.success) {
        console.log("✅ Adsgram completed successfully");
      } else {
        console.log("⚠️ Adsgram: No ads available");
      }
    } catch (error) {
      console.error("❌ Adsgram error:", error);
    } finally {
      setAdsgramWatching(false);
    }
  };

  // Get status message and icon
  const getStatusInfo = (
    status: "idle" | "no-ads" | "success" | "error",
    isReady: boolean,
    isLoading: boolean
  ) => {
    if (isLoading) {
      return {
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
        text: "Watching...",
        color: "text-blue-400",
      };
    }

    if (!isReady) {
      return {
        icon: <span className="w-2 h-2 bg-gray-500 rounded-full"></span>,
        text: "Loading SDK...",
        color: "text-gray-500",
      };
    }

    switch (status) {
      case "no-ads":
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: "Ads might not be available",
          color: "text-yellow-400",
        };
      case "success":
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          text: "Completed! +10 Dust",
          color: "text-green-400",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: "Try again",
          color: "text-orange-400",
        };
      default:
        return {
          icon: (
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          ),
          text: "Ready to watch",
          color: "text-green-400",
        };
    }
  };

  const adExtraStatus = getStatusInfo(
    adExtra.lastAttemptStatus,
    adExtra.isReady,
    adExtra.isLoading
  );

  const adsgramStatus = getStatusInfo(
    adsgram.lastAttemptStatus,
    adsgram.isReady,
    adsgram.isLoading
  );

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Tv className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Watch Ads</h3>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-gray-400 text-sm">Reward per ad:</span>
        <img src="/dust.svg" alt="Dust" className="w-5 h-5" />
        <span className="text-purple-400 font-bold">{dustReward} Dust</span>
      </div>

      {/* Ad Network Buttons */}
      <div className="space-y-3">
        {/* AdExtra Button */}
        <div className="space-y-2">
          <motion.button
            onClick={handleWatchAdExtra}
            disabled={!adExtra.isReady || adExtraWatching}
            whileHover={
              adExtra.isReady && !adExtraWatching ? { scale: 1.02 } : {}
            }
            whileTap={
              adExtra.isReady && !adExtraWatching ? { scale: 0.98 } : {}
            }
            className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              adExtra.isReady && !adExtraWatching
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {adExtraWatching ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
                Watching AdExtra...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Watch AdExtra
              </>
            )}
          </motion.button>

          {/* AdExtra Status */}
          <motion.div
            key={adExtra.lastAttemptStatus}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-center gap-2 text-xs ${adExtraStatus.color}`}
          >
            {adExtraStatus.icon}
            <span>{adExtraStatus.text}</span>
          </motion.div>
        </div>

        {/* Adsgram Button */}
        <div className="space-y-2">
          <motion.button
            onClick={handleWatchAdsgram}
            disabled={!adsgram.isReady || adsgramWatching}
            whileHover={
              adsgram.isReady && !adsgramWatching ? { scale: 1.02 } : {}
            }
            whileTap={
              adsgram.isReady && !adsgramWatching ? { scale: 0.98 } : {}
            }
            className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              adsgram.isReady && !adsgramWatching
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {adsgramWatching ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
                Watching Adsgram...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Watch Adsgram
              </>
            )}
          </motion.button>

          {/* Adsgram Status */}
          <motion.div
            key={adsgram.lastAttemptStatus}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-center gap-2 text-xs ${adsgramStatus.color}`}
          >
            {adsgramStatus.icon}
            <span>{adsgramStatus.text}</span>
          </motion.div>
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-4 pt-4 border-t border-purple-500/20">
        <p className="text-xs text-center text-gray-400">
          Choose any available ad network to earn Dust
        </p>
      </div>
    </div>
  );
};
