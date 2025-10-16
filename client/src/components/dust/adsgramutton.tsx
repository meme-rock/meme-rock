<div className="space-y-2">
  <motion.button
    onClick={handleWatchAdsgram}
    disabled={!adsgram.isReady || adsgramWatching}
    whileHover={adsgram.isReady && !adsgramWatching ? { scale: 1.02 } : {}}
    whileTap={adsgram.isReady && !adsgramWatching ? { scale: 0.98 } : {}}
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
</div>;
