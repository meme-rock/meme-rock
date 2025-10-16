import { useState, useCallback, useMemo } from "react";
import { useAdExtra } from "./useAdExtra";
import { useAdsgram } from "./useAdsgram";

/**
 * Unified Ad Hook - AdExtra öncelikli, fallback olarak Adsgram
 * AdExtra hazırsa onu gösterir, değilse Adsgram'a geçer
 */
export const useUnifiedAd = (adsgramBlockId: string) => {
  const [isWatching, setIsWatching] = useState(false);
  const adExtra = useAdExtra();
  const adsgram = useAdsgram(adsgramBlockId);

  /**
   * Check if any ad is ready
   * Returns true if at least one network has ads available
   */
  const isAdReady = useMemo(() => {
    return adExtra.isReady || adsgram.isReady;
  }, [adExtra.isReady, adsgram.isReady]);

  /**
   * Check which network is ready
   */
  const availableNetwork = useMemo(() => {
    if (adExtra.isReady) return "adextra";
    if (adsgram.isReady) return "adsgram";
    return "none";
  }, [adExtra.isReady, adsgram.isReady]);

  /**
   * Show ad from available network
   * Priority: AdExtra > Adsgram
   */
  const showAd = useCallback(async (): Promise<{
    success: boolean;
    network: "adextra" | "adsgram" | "none";
  }> => {
    if (isWatching) {
      return { success: false, network: "none" };
    }

    if (!isAdReady) {
      console.log("⚠️ No ads available from any network");
      return { success: false, network: "none" };
    }

    setIsWatching(true);

    try {
      // Try AdExtra first (priority)
      if (adExtra.isReady) {
        console.log("📺 Showing AdExtra...");
        const adExtraResult = await adExtra.showAd();

        if (adExtraResult) {
          console.log("✅ AdExtra ad completed");
          setIsWatching(false);
          return { success: true, network: "adextra" };
        }

        console.log("⚠️ AdExtra failed, trying Adsgram...");
      }

      // Fallback to Adsgram
      if (adsgram.isReady) {
        console.log("📺 Showing Adsgram...");
        const adsgramResult = await adsgram.showAd();

        setIsWatching(false);

        if (adsgramResult.success) {
          console.log("✅ Adsgram ad completed");
          return { success: true, network: "adsgram" };
        }
      }

      setIsWatching(false);
      return { success: false, network: "none" };
    } catch (error) {
      console.error("❌ Ad show error:", error);
      setIsWatching(false);
      return { success: false, network: "none" };
    }
  }, [isWatching, isAdReady, adExtra, adsgram]);

  return {
    isWatching: isWatching || adExtra.isLoading || adsgram.isLoading,
    isAdReady,
    availableNetwork,
    showAd,
    adExtraReady: adExtra.isReady,
    adsgramReady: adsgram.isReady,
  };
};
