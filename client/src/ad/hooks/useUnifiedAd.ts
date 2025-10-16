import { useState, useCallback, useMemo, useRef } from "react";
import { useAdExtra } from "./useAdExtra";
import { useAdsgram } from "./useAdsgram";

/**
 * Unified Ad Hook - MAXIMUM PROTECTION
 * Absolute guarantee: Only ONE ad shows at a time
 */
export const useUnifiedAd = (adsgramBlockId: string) => {
  const [isWatching, setIsWatching] = useState(false);
  const adExtra = useAdExtra();
  const adsgram = useAdsgram(adsgramBlockId);

  // Triple lock system
  const lockRef = useRef({
    isLocked: false,
    currentNetwork: null as "adextra" | "adsgram" | null,
    lockTime: 0,
  });

  const isAdReady = useMemo(() => {
    return adExtra.isReady || adsgram.isReady;
  }, [adExtra.isReady, adsgram.isReady]);

  const availableNetwork = useMemo(() => {
    if (adExtra.isReady) return "adextra";
    if (adsgram.isReady) return "adsgram";
    return "none";
  }, [adExtra.isReady, adsgram.isReady]);

  /**
   * Acquire lock - returns true if lock acquired, false if already locked
   */
  const acquireLock = useCallback((network: "adextra" | "adsgram"): boolean => {
    const now = Date.now();

    // Check if already locked
    if (lockRef.current.isLocked) {
      const timeSinceLock = now - lockRef.current.lockTime;
      console.log(
        `🔒 LOCKED by ${lockRef.current.currentNetwork} (${timeSinceLock}ms ago)`
      );
      return false;
    }

    // Acquire lock
    lockRef.current = {
      isLocked: true,
      currentNetwork: network,
      lockTime: now,
    };
    console.log(`🔓 LOCK ACQUIRED by ${network}`);
    return true;
  }, []);

  /**
   * Release lock
   */
  const releaseLock = useCallback(() => {
    if (lockRef.current.isLocked) {
      console.log(`🔓 LOCK RELEASED by ${lockRef.current.currentNetwork}`);
    }
    lockRef.current = {
      isLocked: false,
      currentNetwork: null,
      lockTime: 0,
    };
  }, []);

  /**
   * Show ad with MAXIMUM protection
   */
  const showAd = useCallback(async (): Promise<{
    success: boolean;
    network: "adextra" | "adsgram" | "none";
  }> => {
    // Guard 1: State check
    if (isWatching) {
      console.log("⚠️ Already watching, ABORT");
      return { success: false, network: "none" };
    }

    // Guard 2: Lock check
    if (lockRef.current.isLocked) {
      console.log("⚠️ System LOCKED, ABORT");
      return { success: false, network: "none" };
    }

    if (!isAdReady) {
      console.log("⚠️ No networks available");
      return { success: false, network: "none" };
    }

    setIsWatching(true);
    console.log(`\n🎯 === AD REQUEST START === `);
    console.log(
      `Networks: AdExtra ${adExtra.isReady ? "✅" : "❌"} | Adsgram ${
        adsgram.isReady ? "✅" : "❌"
      }`
    );

    try {
      // TRY 1: AdExtra (200ms timeout)
      if (adExtra.isReady) {
        if (!acquireLock("adextra")) {
          setIsWatching(false);
          return { success: false, network: "none" };
        }

        console.log("📺 [1/2] Trying AdExtra...");

        try {
          const adExtraResult = await adExtra.showAd();

          if (adExtraResult.adOpened) {
            console.log("✅ AdExtra opened window");
            releaseLock();
            setIsWatching(false);
            console.log(`=== AD REQUEST END (AdExtra) ===\n`);

            return {
              success: adExtraResult.success,
              network: "adextra",
            };
          }

          // No ad opened, release lock and try Adsgram
          console.log("❌ AdExtra: No ads");
          releaseLock();
        } catch (error) {
          console.error("❌ AdExtra error:", error);
          releaseLock();
        }
      }

      // Check lock before Adsgram
      if (lockRef.current.isLocked) {
        console.log("⚠️ Lock still held, cannot try Adsgram");
        setIsWatching(false);
        return { success: false, network: "none" };
      }

      // TRY 2: Adsgram (fallback)
      if (adsgram.isReady) {
        if (!acquireLock("adsgram")) {
          setIsWatching(false);
          return { success: false, network: "none" };
        }

        console.log("📺 [2/2] Trying Adsgram...");

        try {
          const adsgramResult = await adsgram.showAd();

          releaseLock();
          setIsWatching(false);
          console.log(`=== AD REQUEST END (Adsgram) ===\n`);

          return {
            success: adsgramResult.success,
            network: "adsgram",
          };
        } catch (error) {
          console.error("❌ Adsgram error:", error);
          releaseLock();
          setIsWatching(false);
          return { success: false, network: "adsgram" };
        }
      }

      // No ads available
      releaseLock();
      setIsWatching(false);
      console.log(`=== AD REQUEST END (No ads) ===\n`);
      return { success: false, network: "none" };
    } catch (error) {
      console.error("❌ CRITICAL ERROR:", error);
      releaseLock();
      setIsWatching(false);
      return { success: false, network: "none" };
    }
  }, [isWatching, isAdReady, adExtra, adsgram, acquireLock, releaseLock]);

  return {
    isWatching: isWatching || adExtra.isLoading || adsgram.isLoading,
    isAdReady,
    availableNetwork,
    showAd,
    adExtraReady: adExtra.isReady,
    adsgramReady: adsgram.isReady,
  };
};
