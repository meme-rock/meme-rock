import { useState, useMemo, useCallback, useEffect } from "react";
import { MinerLevelThumbnails } from "../components/miner/MinerLevelThumbnails";
import { MinerDisplay } from "../components/miner/MinerDisplay";
import { MineButton } from "../components/miner/MineButton";
import { MinerUpgradeButton } from "../components/miner/MinerUpgradeButton";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";
import { useUpgradeMinerMutation } from "../redux/services/miner/miner-api";
import WebApp from "@twa-dev/sdk";
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

  const handleUpgradeRequest = useCallback(() => {
    setIsConfirmOpen(true);
  }, []);

  const handleConfirmUpgrade = async () => {
    if (isUpgrading) return;
    try {
      await upgradeMiner({ user_id: userId }).unwrap();
      WebApp.showAlert("Miner upgraded successfully!");
      setIsConfirmOpen(false);
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to upgrade miner.";
      WebApp.showAlert(errorMessage);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative flex flex-col overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/15 via-transparent to-transparent" />
        <div className="absolute bottom-0 w-full h-[40vh] bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full pt-3 max-w-lg mx-auto w-full">
        {/* 1. Thumbnails */}
        <div className="flex-shrink-0 mb-1">
          <MinerLevelThumbnails
            currentLevel={currentUserMinerLevel}
            selectedLevel={selectedMinerLevel}
            minLevel={currentUserMinerLevel}
            maxLevel={5}
            onLevelSelect={handleLevelSelect}
          />
        </div>

        {/* 2. Visual Area */}
        <div className="flex-grow flex items-center justify-center">
          <MinerDisplay
            selectedMiner={selectedMiner}
            currentUserMinerLevel={currentUserMinerLevel}
          />
        </div>

        {/* 3. Action Area */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2 pb-2">
          <MinerUpgradeButton
            selectedMiner={selectedMiner}
            currentUserMinerLevel={currentUserMinerLevel}
            onUpgrade={handleUpgradeRequest}
          />

          <MineButton
            hourlyReward={selectedMiner.profit_per_hour}
            rewardType={selectedMiner.reward_type}
            isCurrentMiner={selectedMiner._id === current_miner._id}
            maxPeriods={selectedMiner.max_periods}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
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
