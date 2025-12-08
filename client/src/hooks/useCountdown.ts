import { useState, useEffect } from "react";

// Milisaniyeyi formatlar
// Örnek: 1 günden fazlaysa -> "3D 05:20:10"
// 1 günden azsa -> "05:20:10"
const formatTime = (milliseconds: number) => {
  if (milliseconds <= 0) return "00:00:00";

  const totalSeconds = Math.floor(milliseconds / 1000);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  // Eğer 1 gün veya daha fazlası varsa "xD HH:MM:SS" formatı
  if (days > 0) {
    return `${days}D ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  // 24 saatten azsa standart "HH:MM:SS" formatı
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Belirli bir hedef tarihe (next_mine) kadar geri sayım yapan bir hook.
 * @param targetDateISO - Geri sayımın biteceği tarih (ISO string formatında).
 */
export const useCountdown = (targetDateISO: string | Date) => {
  const targetTime = new Date(targetDateISO).getTime();

  // İlk renderda hemen hesapla
  const calculateRemaining = () => {
    const now = new Date().getTime();
    const diff = targetTime - now;
    return diff > 0 ? diff : 0;
  };

  const [remainingMs, setRemainingMs] = useState(calculateRemaining());

  useEffect(() => {
    // targetDateISO değiştiğinde anında güncelle
    setRemainingMs(calculateRemaining());

    // Eğer süre zaten dolmuşsa interval başlatma
    if (calculateRemaining() <= 0) return;

    const interval = setInterval(() => {
      const newRemaining = calculateRemaining();

      if (newRemaining <= 0) {
        clearInterval(interval);
        setRemainingMs(0);
      } else {
        setRemainingMs(newRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateISO, targetTime]);

  return {
    isReady: remainingMs <= 0,
    formattedTime: formatTime(remainingMs),
    remainingMs: remainingMs,
  };
};
