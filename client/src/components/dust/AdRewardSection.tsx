import { motion } from "framer-motion";
import { Loader2, Tv, AlertCircle, CheckCircle } from "lucide-react";
import { useAdExtra } from "../../ad/hooks/useAdExtra";
import { useState, useEffect } from "react";
import { useUpdateUserDustAfterAdRewardMutation } from "../../redux/services/user/user-api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export const AdRewardSection = () => {
  const user = useSelector((state: RootState) => state.user);
  const { showAd, message, lastAttemptStatus } = useAdExtra();
  const [updateUserDustAfterAdReward] =
    useUpdateUserDustAfterAdRewardMutation();
  const [adExtraWatching, setAdExtraWatching] = useState(false);

  const dustReward = 5;
  const isLoading = message === "Loading...";

  // Watch for successful ad completion
  useEffect(() => {
    if (lastAttemptStatus && message === "Ready" && adExtraWatching) {
      console.log("✅ AdExtra completed successfully");

      // Wait 1 second, then fetch updated balance
      setTimeout(() => {
        console.log("⏳ Fetching updated dust balance...");
        updateUserDustAfterAdReward({ user_id: user._id });
      }, 1000);

      setAdExtraWatching(false);
    }
  }, [
    lastAttemptStatus,
    message,
    adExtraWatching,
    user._id,
    updateUserDustAfterAdReward,
  ]);

  // AdExtra button handler
  const handleWatchAdExtra = async () => {
    console.log("📺 User clicked AdExtra button");
    setAdExtraWatching(true);
    showAd();
  };

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
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/30"
            }`}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
                Watching Ad...
              </>
            ) : (
              <>
                <Tv className="w-5 h-5" />
                Watch AdExtra
              </>
            )}
          </motion.button>

          {/* AdExtra Status Message */}
          {message && message !== "Loading..." && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2"
            >
              {lastAttemptStatus ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">
                    {message}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-medium">
                    {message}
                  </span>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Adsgram Button Later ı will add it*/}
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
