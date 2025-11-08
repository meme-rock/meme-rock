import { motion } from "framer-motion";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../redux/store";
import { useMineMutation } from "../../redux/services/miner/miner-api";
import WebApp from "@twa-dev/sdk";
import { memo } from "react";
import { EMinerRewardType } from "../../types/enums";
import { useCountdown } from "../../hooks/useCountdown";
import { useMinerPeriods } from "../../hooks/useMinerPeriods";

interface MiningProgressProps {
  hourlyReward: number;
  rewardType: EMinerRewardType;
  isCurrentMiner: boolean;
}

export const MineButton = memo(
  ({ hourlyReward, rewardType, isCurrentMiner }: MiningProgressProps) => {
    // --- 1. VERİ VE MANTIK ---
    const userId = useSelector((state: RootState) => state.user._id);
    const minerData = useSelector(
      (state: RootState) => state.user.miner_data,
      shallowEqual
    );
    const isPremium = useSelector((state: RootState) => state.user.is_premium);
    const isAutoMining = useSelector(
      (state: RootState) => state.user.is_auto_mining
    );

    const [mine, { isLoading: isClaiming }] = useMineMutation();

    // Gerçek zamanlı claimable_periods ve next_mine hesaplama
    const { claimablePeriods, nextMine } = useMinerPeriods(
      minerData.last_mine,
      minerData.max_periods,
      isPremium,
      isAutoMining
    );

    const maxPeriods = minerData.max_periods;
    const isStorageFull = claimablePeriods >= maxPeriods;

    // Butonun aktifliği SADECE depodaki periyot sayısına bağlı
    const canClaim = claimablePeriods > 0;

    // Gösterilecek ödül SADECE depodaki periyotlara bağlı
    const displayReward = hourlyReward * claimablePeriods;

    // Geri sayım sayacı - dinamik next_mine kullanılıyor
    const { formattedTime } = useCountdown(nextMine);

    // Depolama ilerlemesini % olarak hesapla (Görsel bar için)
    const progressPercent = (claimablePeriods / maxPeriods) * 100;

    // Claim fonksiyonu (Değişiklik yok)
    const handleClaim = async () => {
      try {
        const result = await mine({ user_id: userId }).unwrap();
        console.log("✅ Mining reward claimed!", result);
        WebApp.showAlert(
          `Successfully claimed ${displayReward} ${rewardType}!`
        );
      } catch (error: any) {
        console.error("❌ Claim failed:", error);
        const errorMessage =
          error?.data?.message || "Failed to claim mining reward";
        WebApp.showAlert(errorMessage);
      }
    };

    return (
      <div className="flex flex-col items-center gap-4 w-full px-4">
        {!isCurrentMiner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-8 py-3 rounded-2xl backdrop-blur-sm border border-cyan-500/20"
          >
            <img
              src={
                rewardType === EMinerRewardType.STONE
                  ? "/stone.svg"
                  : "/dust.svg"
              }
              alt="Reward"
              className="w-10 h-10" // Boyut eski haline (10) getirildi
            />
            <div className="flex flex-col items-start">
              <span className="text-cyan-400 text-xs font-medium">
                Profit Per Hour
              </span>
              <span className="text-white font-bold text-xl">
                + {hourlyReward}
              </span>
            </div>
          </motion.div>
        )}

        {/* Kompakt Durum Kartı (Sadeleştirilmiş) */}
        {isCurrentMiner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black border border-cyan-500/30 rounded-2xl p-4 flex flex-col gap-3"
          >
            {/* Saatlik Kâr */}
            <div className="flex items-center gap-1.5">
              <img
                src={
                  rewardType === EMinerRewardType.STONE
                    ? "/stone.svg"
                    : "/dust.svg"
                }
                alt="Reward"
                className="w-5 h-5"
              />
              <span className="text-white font-medium text-sm">
                + {hourlyReward}
              </span>
              <span className="text-cyan-400 text-xs">/ hour</span>
            </div>
            {/* Üst Kısım: Depo Durumu (Metin) */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm font-semibold">
                Mining Storage
              </span>
              <div
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isStorageFull
                    ? "bg-green-500/20 text-green-400"
                    : "bg-cyan-500/20 text-cyan-400"
                }`}
              >
                {claimablePeriods}/{maxPeriods}
              </div>
            </div>

            {/* Orta Kısım: Toplanabilir Ana Ödül */}
            <div className="text-center my-2">
              <span className="text-gray-400 text-xs">Available to Claim</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <img
                  src={
                    rewardType === EMinerRewardType.STONE
                      ? "/stone.svg"
                      : "/dust.svg"
                  }
                  alt="Reward"
                  className="w-8 h-8" // 8'e düşürüldü (daha kompakt)
                />
                <span className="text-white font-bold text-3xl">
                  {displayReward}
                </span>
              </div>
            </div>

            {/* Alt Kısım: İlerleme Çubuğu ve Geri Sayım */}
            <div className="w-full">
              {/* Görsel İlerleme Çubuğu (Progress Bar) */}
              <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden border border-cyan-900/50">
                <motion.div
                  className={`h-2.5 rounded-full ${
                    isStorageFull
                      ? "bg-gradient-to-r from-green-500 to-cyan-500"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500"
                  }`}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Geri Sayım Metni (Depo doluysa "Full" yazar) */}
              <div className="text-center text-xs mt-2">
                {!isStorageFull && (
                  <span className="text-cyan-400">
                    Next in: {formattedTime}
                  </span>
                )}
                {isStorageFull && (
                  <span className="font-semibold text-green-400 flex items-center justify-center gap-1">
                    Storage Full
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Toplama Butonu (Ayrı ve Efektsiz) */}
        {isCurrentMiner && (
          <motion.button
            onClick={handleClaim}
            disabled={!canClaim || isClaiming}
            whileTap={canClaim && !isClaiming ? { scale: 0.95 } : {}}
            className={`w-full max-w-md py-4 rounded-xl font-bold text-lg transition-all relative ${
              canClaim && !isClaiming
                ? "bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {/* Shine efekti kaldırıldı */}
            <span className="relative z-10">
              {isClaiming
                ? "Claiming..."
                : canClaim
                ? `Claim ${displayReward} ${rewardType}`
                : "Mining..."}
            </span>
          </motion.button>
        )}
      </div>
    );
  }
);
