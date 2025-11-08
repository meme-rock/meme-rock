import { useState, useEffect } from "react";

/**
 * Miner periyotlarını gerçek zamanlı olarak hesaplayan hook.
 * Her saniye güncellenir ve claimable_periods sayısını ve dinamik next_mine değerini döner.
 */
export const useMinerPeriods = (
  lastMine: string | Date,
  maxPeriods: number,
  isPremium: boolean,
  isAutoMining: boolean
) => {
  // Backend'deki değerler ile senkronize
  const MINING_COOLDOWN_MS = 15 * 1000; // 15 saniye (test için) - backend ile aynı

  const [claimablePeriods, setClaimablePeriods] = useState(0);
  const [nextMine, setNextMine] = useState<Date>(new Date());

  useEffect(() => {
    const calculatePeriods = () => {
      const now = new Date().getTime();
      const lastMineTime = new Date(lastMine).getTime();

      // Geçen süreyi hesapla
      const elapsedTime = now - lastMineTime;

      // Eğer henüz bir periyot bile geçmediyse
      if (elapsedTime < MINING_COOLDOWN_MS) {
        setClaimablePeriods(0);
        // İlk periyodun bitiş zamanı
        setNextMine(new Date(lastMineTime + MINING_COOLDOWN_MS));
        return;
      }

      // Kaç periyot geçmiş hesapla
      const elapsedPeriods = Math.floor(elapsedTime / MINING_COOLDOWN_MS);

      // Max periods'u aşmamalı
      const calculatedPeriods = Math.min(elapsedPeriods, maxPeriods);

      setClaimablePeriods(calculatedPeriods);

      // Dinamik next_mine hesaplama
      // Eğer max_periods'a ulaşmadıysak, bir sonraki periyodun bitiş zamanını hesapla
      if (calculatedPeriods < maxPeriods) {
        // Bir sonraki periyodun bitiş zamanı
        const nextPeriodEndTime =
          lastMineTime + (calculatedPeriods + 1) * MINING_COOLDOWN_MS;
        setNextMine(new Date(nextPeriodEndTime));
      } else {
        // Max'a ulaşıldıysa, son periyodun bitiş zamanını göster
        const lastPeriodEndTime =
          lastMineTime + maxPeriods * MINING_COOLDOWN_MS;
        setNextMine(new Date(lastPeriodEndTime));
      }
    };

    // İlk hesaplama
    calculatePeriods();

    // Her saniye güncelle
    const interval = setInterval(calculatePeriods, 1000);

    return () => clearInterval(interval);
  }, [lastMine, maxPeriods, isPremium, isAutoMining, MINING_COOLDOWN_MS]);

  return {
    claimablePeriods,
    nextMine,
    miningCooldownMs: MINING_COOLDOWN_MS,
  };
};
