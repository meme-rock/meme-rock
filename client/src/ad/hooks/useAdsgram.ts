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
 * Adsgram Reward Ad Hook
 * For Reward type blocks (not Task ads)
 */
export const useAdsgram = (blockId: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const adControllerRef = useRef<AdController | null>(null);

  // Initialize Adsgram
  useEffect(() => {
    if (!blockId || !blockId.match(/^\d+$/)) {
      console.warn("⚠️ Adsgram blockId should be a number (e.g., '16184')");
      return;
    }

    const initializeAdsgram = () => {
      if (!window.Adsgram) {
        return false;
      }

      try {
        adControllerRef.current = window.Adsgram.init({
          blockId: blockId,
          debug: false,
        });

        // Event listeners
        adControllerRef.current.addEventListener("onReward", () => {
          console.log("✅ Adsgram: Reward received");
        });

        adControllerRef.current.addEventListener("onComplete", () => {
          setIsLoading(false);
        });

        adControllerRef.current.addEventListener("onStart", () => {
          setIsLoading(true);
        });

        adControllerRef.current.addEventListener("onSkip", () => {
          setIsLoading(false);
        });

        adControllerRef.current.addEventListener("onBannerNotFound", () => {
          console.log("⚠️ Adsgram: No ad available");
          setIsLoading(false);
          setIsReady(false);
        });

        adControllerRef.current.addEventListener("onError", () => {
          console.error("❌ Adsgram: Error occurred");
          setIsLoading(false);
          setIsReady(false);
        });

        setIsInitialized(true);
        setIsReady(true);
        console.log("✅ Adsgram initialized successfully");
        return true;
      } catch (error) {
        console.error("❌ Adsgram initialization error:", error);
        setIsReady(false);
        return false;
      }
    };

    // Wait for SDK to load
    const checkSDK = setInterval(() => {
      if (window.Adsgram) {
        if (initializeAdsgram()) {
          clearInterval(checkSDK);
        }
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkSDK);
      if (!isInitialized) {
        console.error("❌ Adsgram SDK failed to load");
        setIsReady(false);
      }
    }, 10000);

    return () => {
      clearInterval(checkSDK);
      clearTimeout(timeout);
      if (adControllerRef.current) {
        try {
          adControllerRef.current.destroy();
        } catch (error) {
          console.error("Adsgram cleanup error:", error);
        }
      }
    };
  }, [blockId]);

  // Show ad
  const showAd = useCallback(async (): Promise<{ success: boolean }> => {
    if (!adControllerRef.current || !isInitialized || !isReady) {
      console.log("⚠️ Adsgram not ready");
      return { success: false };
    }

    return new Promise((resolve) => {
      setIsLoading(true);

      adControllerRef
        .current!.show()
        .then((result) => {
          setIsLoading(false);
          if (result.error) {
            console.error("❌ Adsgram show error:", result);
            resolve({ success: false });
          } else if (result.done) {
            console.log("✅ Adsgram ad completed");
            resolve({ success: true });
          } else {
            resolve({ success: false });
          }
        })
        .catch((error) => {
          console.error("❌ Adsgram show error:", error);
          setIsLoading(false);
          resolve({ success: false });
        });
    });
  }, [isInitialized, isReady]);

  return {
    isReady,
    isLoading,
    showAd,
  };
};
