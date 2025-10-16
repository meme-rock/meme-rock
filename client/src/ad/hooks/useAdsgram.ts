import { useCallback, useEffect, useState, useRef } from "react";

interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: "load" | "render" | "playing" | "destroy";
  error: boolean;
}

interface AdController {
  show(): Promise<ShowPromiseResult>;
  addEventListener(event: string, handler: () => void): void;
  removeEventListener(event: string, handler: () => void): void;
  destroy(): void;
}

interface AdsgramWindow extends Window {
  Adsgram?: {
    init(params: { blockId: string; debug?: boolean }): AdController;
  };
}

declare const window: AdsgramWindow;

/**
 * Adsgram Reward Ad Hook - With Status Tracking
 */
export const useAdsgram = (blockId: string) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAttemptStatus, setLastAttemptStatus] = useState<
    "idle" | "no-ads" | "success" | "error"
  >("idle");
  const adControllerRef = useRef<AdController | null>(null);
  const initializationAttemptedRef = useRef(false);
  const eventHandlersRef = useRef<Record<string, () => void>>({});

  // Initialize Adsgram once
  useEffect(() => {
    if (!blockId || !blockId.match(/^\d+$/)) {
      console.warn("⚠️ Adsgram: Invalid blockId");
      return;
    }

    if (initializationAttemptedRef.current) {
      return;
    }

    const initializeAdsgram = () => {
      if (!window.Adsgram) {
        return false;
      }

      try {
        console.log("🔄 Initializing Adsgram...");
        adControllerRef.current = window.Adsgram.init({
          blockId: blockId,
          debug: false,
        });

        eventHandlersRef.current = {
          onReward: () => {
            console.log("✅ Adsgram: Reward event");
          },
          onComplete: () => {
            console.log("✅ Adsgram: Ad completed");
            setIsLoading(false);
            setLastAttemptStatus("success");
          },
          onStart: () => {
            console.log("📺 Adsgram: Ad started");
            setIsLoading(true);
          },
          onSkip: () => {
            console.log("⏭️ Adsgram: Ad skipped");
            setIsLoading(false);
            setLastAttemptStatus("error");
          },
          onBannerNotFound: () => {
            console.log("⚠️ Adsgram: No ad available");
            setIsLoading(false);
            setLastAttemptStatus("no-ads");
          },
          onError: () => {
            console.log("⚠️ Adsgram: Ad error");
            setIsLoading(false);
            setLastAttemptStatus("error");
          },
        };

        Object.entries(eventHandlersRef.current).forEach(([event, handler]) => {
          adControllerRef.current!.addEventListener(event, handler);
        });

        setIsReady(true);
        initializationAttemptedRef.current = true;
        console.log("✅ Adsgram initialized");
        return true;
      } catch (error) {
        console.error("❌ Adsgram initialization error:", error);
        setIsReady(false);
        return false;
      }
    };

    if (window.Adsgram) {
      initializeAdsgram();
      return;
    }

    let attempts = 0;
    const maxAttempts = 100;
    const checkSDK = setInterval(() => {
      attempts++;
      if (window.Adsgram) {
        if (initializeAdsgram()) {
          clearInterval(checkSDK);
        }
      } else if (attempts >= maxAttempts) {
        console.error("❌ Adsgram: SDK not loaded");
        clearInterval(checkSDK);
        setIsReady(false);
      }
    }, 100);

    return () => {
      clearInterval(checkSDK);
      if (adControllerRef.current) {
        try {
          Object.entries(eventHandlersRef.current).forEach(
            ([event, handler]) => {
              adControllerRef.current!.removeEventListener(event, handler);
            }
          );
          adControllerRef.current.destroy();
          adControllerRef.current = null;
        } catch (error) {
          console.error("⚠️ Adsgram cleanup error:", error);
        }
      }
    };
  }, []);

  const showAd = useCallback(async (): Promise<{ success: boolean }> => {
    if (!adControllerRef.current) {
      console.log("⚠️ Adsgram: Controller not initialized");
      setLastAttemptStatus("error");
      return { success: false };
    }

    if (!isReady) {
      console.log("⚠️ Adsgram: Not ready");
      setLastAttemptStatus("error");
      return { success: false };
    }

    if (isLoading) {
      console.log("⚠️ Adsgram: Already showing");
      return { success: false };
    }

    try {
      setIsLoading(true);
      // Reset status at the START of new attempt
      setLastAttemptStatus("idle");
      console.log("📺 Adsgram: Showing ad...");

      const result = await adControllerRef.current.show();

      setIsLoading(false);

      if (result.error) {
        console.log("⚠️ Adsgram: Show returned error");
        setLastAttemptStatus("error");
        return { success: false };
      }

      if (result.done) {
        console.log("✅ Adsgram: Completed");
        setLastAttemptStatus("success");
        return { success: true };
      }

      console.log("⚠️ Adsgram: Not completed");
      setLastAttemptStatus("error");
      return { success: false };
    } catch (error) {
      console.error("❌ Adsgram: Show error:", error);
      setIsLoading(false);
      setLastAttemptStatus("error");
      return { success: false };
    }
  }, [isReady, isLoading]);

  // Auto-reset status after success (but not error/no-ads)
  useEffect(() => {
    if (lastAttemptStatus === "success") {
      const timer = setTimeout(() => {
        console.log("🔄 Adsgram: Resetting status to idle");
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
