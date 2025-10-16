import { useState, useCallback } from "react";

export function useAdExtra() {
  const [message, setMessage] = useState<string>("");
  const [lastAttemptStatus, setLastAttemptStatus] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);

  const showAd = useCallback(() => {
    try {
      setMessage("Loading...");

      const onSuccess = () => {
        console.log("✅ AdExtra: Ad successfully shown");
        setMessage("Ready");
        setLastAttemptStatus(true);
      };

      const onError = () => {
        console.warn("❌ AdExtra: Failed to show ad");
        setMessage("There might be no ads available");
        setLastAttemptStatus(false);
      };

      if (typeof window !== "undefined" && (window as any).p_adextra) {
        (window as any).p_adextra(onSuccess, onError);
      } else {
        console.warn("⚠️ AdExtra script not loaded yet");
        setIsReady(false);
        setLastAttemptStatus(false);
      }
    } catch (e) {
      console.error("💥 Error triggering AdExtra ad:", e);
      setMessage("Error triggering AdExtra");
      setLastAttemptStatus(false);
    }
  }, []);

  return { showAd, message, lastAttemptStatus, isReady };
}
