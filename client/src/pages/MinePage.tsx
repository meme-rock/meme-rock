import { useState, useMemo, useCallback, useEffect } from "react";
import { MinerLevelThumbnails } from "../components/miner/MinerLevelThumbnails";
import { MinerDisplay } from "../components/miner/MinerDisplay";
import { MineButton } from "../components/miner/MineButton";
import { MinerUpgradeButton } from "../components/miner/MinerUpgradeButton";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";
import { useUpgradeMinerMutation } from "../redux/services/miner/miner-api";
import WebApp from "@twa-dev/sdk";
// Import Confirm Modal
import { ConfirmModal } from "../components/shared/ConfirmModal";

export const MinePage = () => {
  const userId = useSelector((state: RootState) => state.user._id);
  const current_miner = useSelector(
    (state: RootState) => state.miner.current_miner,
    shallowEqual
  );
  const all_miners = useSelector(
    (state: RootState) => state.miner.all_miners,
    shallowEqual
  );

  const [upgradeMiner, { isLoading: isUpgrading }] = useUpgradeMinerMutation();

  // --- MODAL STATE ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const currentUserMinerLevel = useMemo(
    () => parseInt(current_miner._id.split("_")[1]),
    [current_miner._id]
  );

  const [selectedMinerLevel, setSelectedMinerLevel] = useState(
    currentUserMinerLevel
  );

  useEffect(() => {
    setSelectedMinerLevel(currentUserMinerLevel);
  }, [currentUserMinerLevel]);

  const selectedMiner = useMemo(
    () =>
      all_miners.find((m) => m._id === `LEVEL_${selectedMinerLevel}`) ||
      current_miner,
    [selectedMinerLevel, all_miners, current_miner]
  );

  const handleLevelSelect = useCallback((level: number) => {
    setSelectedMinerLevel(level);
  }, []);

  // 1. ADIM: Butona basınca Modalı Aç
  const handleUpgradeRequest = useCallback(() => {
    setIsConfirmOpen(true);
  }, []);

  // 2. ADIM: Modalda onaylayınca API isteğini at
  const handleConfirmUpgrade = async () => {
    if (isUpgrading) return;
    try {
      await upgradeMiner({ user_id: userId }).unwrap();
      WebApp.showAlert("Miner upgraded successfully! 🎉");
      setIsConfirmOpen(false); // Başarılı olursa modalı kapat
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to upgrade miner.";
      WebApp.showAlert(errorMessage);
      setIsConfirmOpen(false); // Hata alsa da modalı kapat (veya açık bırakıp hata gösterilebilir)
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-cyan-900/20 to-transparent" />
        <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      {/* Main Content - Vertical Layout */}
      <div className="relative z-10 flex flex-col h-full pt-4 max-w-lg mx-auto w-full">
        {/* 1. Thumbnails */}
        <div className="flex-shrink-0 mb-2">
          <MinerLevelThumbnails
            currentLevel={currentUserMinerLevel}
            selectedLevel={selectedMinerLevel}
            minLevel={currentUserMinerLevel}
            maxLevel={5}
            onLevelSelect={handleLevelSelect}
          />
        </div>

        {/* 2. Visual Area (Profit + Image + Level) - Flex Grow */}
        <div className="flex-grow flex items-center justify-center -mt-6">
          <MinerDisplay
            selectedMiner={selectedMiner}
            currentUserMinerLevel={currentUserMinerLevel}
          />
        </div>

        {/* 3. Action Area (Upgrade + Storage/Claim) */}
        <div className="flex-shrink-0 flex flex-col items-center">
          {/* Upgrade Button (Direkt Level'ın altında) */}
          <MinerUpgradeButton
            selectedMiner={selectedMiner}
            currentUserMinerLevel={currentUserMinerLevel}
            // Artık direkt upgrade yerine modal açma fonksiyonunu veriyoruz
            onUpgrade={handleUpgradeRequest}
          />

          {/* Storage/Claim Bar (En altta yatay) */}
          <MineButton
            hourlyReward={selectedMiner.profit_per_hour}
            rewardType={selectedMiner.reward_type}
            isCurrentMiner={selectedMiner._id === current_miner._id}
            maxPeriods={selectedMiner.max_periods}
          />
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmUpgrade}
        title={`Upgrade to Level ${currentUserMinerLevel + 1}`}
        description={`Are you sure you want to upgrade your miner to Level ${
          currentUserMinerLevel + 1
        }?`}
        amount={selectedMiner.stone_price_to_upgrade}
        currency="STONE"
        isLoading={isUpgrading}
      />
    </div>
  );
};
