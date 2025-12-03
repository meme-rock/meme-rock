import { motion } from "framer-motion";
import { Loader2, Play, CheckCircle, AlertCircle } from "lucide-react";
import { useAdExtra } from "../../../ad/hooks/useAdExtra";
import { useAdsgram } from "../../../ad/hooks/useAdsgram";
import { useState, useEffect } from "react";
import { useUpdateAfterAdRewardMutation } from "../../../redux/services/ad/ad-api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const ADSGRAM_BLOCK_ID = import.meta.env.VITE_ADSGRAM_BLOCK_ID || "";

export const AdRewardSection = () => {
  const user = useSelector((state: RootState) => state.user);
  const { showAd, message, lastAttemptStatus } = useAdExtra();
  const adsgram = useAdsgram(ADSGRAM_BLOCK_ID);
  const [updateUserAfterAdReward] = useUpdateAfterAdRewardMutation();
  const [adExtraWatching, setAdExtraWatching] = useState(false);
  const [adsgramWatching, setAdsgramWatching] = useState(false);

  const dustReward = 5;
  const isLoading = message === "Loading...";
  const isAdsgramLoading = adsgram.isLoading;

  // Watch for successful ad completion
  useEffect(() => {
    if (lastAttemptStatus && message === "Ready" && adExtraWatching) {
      console.log("✅ AdExtra completed successfully");

      setTimeout(() => {
        console.log("⏳ Fetching updated dust balance...");
        updateUserAfterAdReward({ user_id: user._id });
      }, 1000);

      setAdExtraWatching(false);
    }
  }, [
    lastAttemptStatus,
    message,
    adExtraWatching,
    user._id,
    updateUserAfterAdReward,
  ]);

  // Watch for successful Adsgram ad completion
  useEffect(() => {
    if (adsgram.lastAttemptStatus === "success" && adsgramWatching) {
      console.log("✅ Adsgram completed successfully");

      setTimeout(() => {
        console.log("⏳ Fetching updated dust balance...");
        updateUserAfterAdReward({ user_id: user._id });
      }, 1000);

      setAdsgramWatching(false);
    }
  }, [
    adsgram.lastAttemptStatus,
    adsgramWatching,
    user._id,
    updateUserAfterAdReward,
  ]);

  // AdExtra button handler
  const handleWatchAdExtra = async () => {
    console.log("📺 User clicked AdExtra button");
    setAdExtraWatching(true);
    showAd();
  };

  // Adsgram button handler
  const handleWatchAdsgram = async () => {
    if (!adsgram.isReady || isAdsgramLoading) return;

    console.log("📺 User clicked Adsgram button");
    setAdsgramWatching(true);

    const result = await adsgram.showAd();

    if (!result.success) {
      console.log("⚠️ Adsgram: Ad failed or no ads available");
      setAdsgramWatching(false);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-white mb-2">Watch Ads</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">Reward per ad:</span>
          <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            <img src="/dust.svg" alt="Dust" className="w-4 h-4" />
            <span className="text-cyan-400 font-bold text-sm">
              +{dustReward}
            </span>
          </div>
        </div>
      </div>

      {/* Ad Buttons */}
      <div className="space-y-3">
        {/* AdExtra */}
        <div>
          <motion.button
            onClick={handleWatchAdExtra}
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.01 } : {}}
            whileTap={!isLoading ? { scale: 0.99 } : {}}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                AdExtra
              </>
            )}
          </motion.button>

          {/* Status */}
          {message && message !== "Loading..." && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              {lastAttemptStatus ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">{message}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400">{message}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Adsgram */}
        <div>
          <motion.button
            onClick={handleWatchAdsgram}
            disabled={!adsgram.isReady || isAdsgramLoading}
            whileHover={
              adsgram.isReady && !isAdsgramLoading ? { scale: 1.01 } : {}
            }
            whileTap={
              adsgram.isReady && !isAdsgramLoading ? { scale: 0.99 } : {}
            }
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              !adsgram.isReady || isAdsgramLoading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-500 text-white"
            }`}
          >
            {isAdsgramLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Adsgram
              </>
            )}
          </motion.button>

          {/* Status */}
          {!isAdsgramLoading && adsgram.lastAttemptStatus !== "idle" && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              {adsgram.lastAttemptStatus === "success" ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Completed</span>
                </>
              ) : adsgram.lastAttemptStatus === "no-ads" ? (
                <>
                  <AlertCircle className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400">No ads</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-red-400">Try again</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
