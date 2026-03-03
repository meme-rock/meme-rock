import { useCallback, useEffect, useRef, useState } from "react";

interface ShowPromiseResult {
  done: boolean;
  description: string;
  state: "load" | "render" | "playing" | "destroy";
  error: boolean;
}

interface AdController {
  show(): Promise<ShowPromiseResult>;
  destroy(): void;
}

interface AdsgramWindow extends Window {
  Adsgram?: {
    init(params: { blockId: string; debug?: boolean }): AdController;
  };
}

declare const window: AdsgramWindow;

export const useAdsgram = (blockId: string) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAttemptStatus, setLastAttemptStatus] = useState<
    "idle" | "no-ads" | "success" | "error"
  >("idle");
  const adControllerRef = useRef<AdController | null>(null);

  useEffect(() => {
    if (!blockId || !blockId.match(/^\d+$/)) {
      console.warn("⚠️ Adsgram: Invalid blockId");
      return;
    }

    const initialize = () => {
      if (!window.Adsgram) return false;
      try {
        adControllerRef.current = window.Adsgram.init({
          blockId,
          debug: false,
        });
        setIsReady(true);
        console.log("✅ Adsgram initialized");
        return true;
      } catch (error) {
        console.error("❌ Adsgram initialization error:", error);
        return false;
      }
    };

    if (initialize()) return;

    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (initialize()) {
        clearInterval(poll);
      } else if (attempts >= 100) {
        console.error("❌ Adsgram: SDK not loaded after 10s");
        clearInterval(poll);
      }
    }, 100);

    return () => {
      clearInterval(poll);
      if (adControllerRef.current) {
        try {
          adControllerRef.current.destroy();
          adControllerRef.current = null;
        } catch {}
      }
    };
  }, [blockId]);

  const showAd = useCallback(async (): Promise<{ success: boolean }> => {
    if (!adControllerRef.current || !isReady || isLoading) {
      setLastAttemptStatus("error");
      return { success: false };
    }

    try {
      setIsLoading(true);
      setLastAttemptStatus("idle");

      await adControllerRef.current.show();

      // Promise resolved = user watched the ad completely
      setLastAttemptStatus("success");
      return { success: true };
    } catch (result: unknown) {
      // Promise rejected = user skipped, no ads, or error
      const res = result as ShowPromiseResult | undefined;
      if (res && !res.error && res.state === "load") {
        setLastAttemptStatus("no-ads");
      } else {
        setLastAttemptStatus("error");
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [isReady, isLoading]);

  // Auto-reset status after success
  useEffect(() => {
    if (lastAttemptStatus === "success") {
      const timer = setTimeout(() => setLastAttemptStatus("idle"), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastAttemptStatus]);

  return { isReady, isLoading, lastAttemptStatus, showAd };
};
