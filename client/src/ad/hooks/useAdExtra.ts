import { useCallback, useState, useEffect } from "react";

/**
 * AdExtra Ad Network Hook - With Status Tracking & Auto-Reset
 * Tracks last attempt status and auto-resets after timeout
 */
export const useAdExtra = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAttemptStatus, setLastAttemptStatus] = useState<
    "idle" | "no-ads" | "success" | "error"
  >("idle");

  // Check if AdExtra SDK is loaded
  useEffect(() => {
    const checkSDK = () => {
      if (typeof window.p_adextra === "function") {
        console.log("✅ AdExtra SDK loaded");
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (checkSDK()) return;

    const interval = setInterval(() => {
      if (checkSDK()) {
        clearInterval(interval);
      }
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  /**
   * Show AdExtra ad with status tracking
   */
  const showAd = useCallback((): Promise<{
    success: boolean;
    adOpened: boolean;
  }> => {
    if (!isReady || typeof window.p_adextra !== "function") {
      console.log("⚠️ AdExtra not ready");
      setLastAttemptStatus("error");
      return Promise.resolve({ success: false, adOpened: false });
    }

    setIsLoading(true);
    // Reset status at the START of new attempt
    setLastAttemptStatus("idle");

    return new Promise((resolve) => {
      let resolved = false;

      // Timeout: 300ms
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.log("⏱️ AdExtra: 300ms timeout - no response");
          setIsLoading(false);
          setLastAttemptStatus("no-ads");
          resolve({ success: false, adOpened: false });
        }
      }, 300);

      const onSuccess = () => {
        if (resolved) {
          console.log("⚠️ AdExtra: onSuccess came too late");
          return;
        }
        resolved = true;
        clearTimeout(timeout);

        console.log("✅ AdExtra: Ad completed!");
        setIsLoading(false);
        setLastAttemptStatus("success");
        resolve({ success: true, adOpened: true });
      };

      const onError = () => {
        if (resolved) {
          console.log("⚠️ AdExtra: onError came too late");
          return;
        }
        resolved = true;
        clearTimeout(timeout);

        console.log("⚠️ AdExtra: No ads available (onError)");
        setIsLoading(false);
        setLastAttemptStatus("no-ads");
        resolve({ success: false, adOpened: false });
      };

      try {
        console.log("📺 AdExtra: Requesting ad (300ms max)...");
        window.p_adextra(onSuccess, onError);
      } catch (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.error("❌ AdExtra: Call error:", error);
          setIsLoading(false);
          setLastAttemptStatus("error");
          resolve({ success: false, adOpened: false });
        }
      }
    });
  }, [isReady]);

  // Auto-reset status after success/error (but not no-ads)
  useEffect(() => {
    if (lastAttemptStatus === "success") {
      const timer = setTimeout(() => {
        console.log("🔄 AdExtra: Resetting status to idle");
        setLastAttemptStatus("idle");
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [lastAttemptStatus]);

  return {
    isReady,
    isLoading,
    lastAttemptStatus,
    showAd,
  };
};
