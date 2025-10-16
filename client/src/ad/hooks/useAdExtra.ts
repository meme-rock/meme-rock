// hooks/useAdExtra.ts (Mevcut ve Uyumlu Hali)

import { useCallback, useState, useEffect } from "react";

/**
 * AdExtra reklam ağını yönetmek için bir React hook'u.
 */
export const useAdExtra = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window.p_adextra === "function") {
        setIsReady(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const checkAdAvailability = useCallback(async (): Promise<boolean> => {
    return isReady;
  }, [isReady]);

  const showAd = useCallback((): Promise<boolean> => {
    if (!isReady) {
      console.log("AdExtra SDK is not ready.");
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      setIsLoading(true);

      const onSuccess = () => {
        console.log("✅ AdExtra: Ad completed successfully.");
        setIsLoading(false);
        resolve(true);
      };

      const onError = () => {
        console.warn("⚠️ AdExtra: Ad failed to show or was not available.");
        setIsLoading(false);
        resolve(false);
      };

      try {
        window.p_adextra(onSuccess, onError);
      } catch (error) {
        console.error("❌ AdExtra: Critical error calling p_adextra.", error);
        setIsLoading(false);
        resolve(false);
      }
    });
  }, [isReady]);

  // YENİ: isLoading durumunu da dışarıya aktarıyoruz.
  return {
    isReady,
    isLoading,
    showAd,
    checkAdAvailability,
  };
};
