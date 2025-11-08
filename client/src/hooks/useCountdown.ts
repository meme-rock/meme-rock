import { useState, useEffect } from "react";

// Milisaniyeyi "00:00:00" formatına çevirir
const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Belirli bir hedef tarihe (next_mine) kadar geri sayım yapan bir hook.
 * @param targetDateISO - Geri sayımın biteceği tarih (ISO string formatında).
 */
export const useCountdown = (targetDateISO: string | Date) => {
  const targetTime = new Date(targetDateISO).getTime();

  const [remainingMs, setRemainingMs] = useState(
    targetTime - new Date().getTime()
  );

  useEffect(() => {
    // targetDateISO değiştiğinde remainingMs'i yeniden hesapla
    const newRemainingMs = targetTime - new Date().getTime();
    setRemainingMs(newRemainingMs);

    // Hedef tarih zaten geçmişse veya geçersizse sayacı başlatma
    if (newRemainingMs <= 0) {
      setRemainingMs(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newRemainingMs = targetTime - now;

      if (newRemainingMs <= 0) {
        clearInterval(interval);
        setRemainingMs(0);
      } else {
        setRemainingMs(newRemainingMs);
      }
    }, 1000); // Her saniye güncelle

    // Component unmount olduğunda interval'ı temizle
    return () => clearInterval(interval);
  }, [targetDateISO, targetTime]); // targetDateISO değiştiğinde sayacı yeniden başlat

  return {
    isReady: remainingMs <= 0,
    formattedTime: formatTime(remainingMs), // "00:01:15"
    remainingMs: remainingMs, // 75000
  };
};
