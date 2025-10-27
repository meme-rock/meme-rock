import { useState, useMemo, useCallback } from "react";
import { MinerLevelThumbnails } from "../components/miner/MinerLevelThumbnails";
import { MinerDisplay } from "../components/miner/MinerDisplay";
import { MineButton } from "../components/miner/MineButton";
import { MinerUpgradeButton } from "../components/miner/MinerUpgradeButton";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";

export const MinePage = () => {
  // Use shallowEqual to prevent unnecessary re-renders when Redux state updates
  const current_miner = useSelector(
    (state: RootState) => state.miner.current_miner,
    shallowEqual
  );
  const all_miners = useSelector(
    (state: RootState) => state.miner.all_miners,
    shallowEqual
  );

  // Current user's miner level - only recompute when current_miner._id changes
  const currentUserMinerLevel = useMemo(
    () => parseInt(current_miner._id.split("_")[1]),
    [current_miner._id]
  );

  // Selected miner state (for browsing)
  const [selectedMinerLevel, setSelectedMinerLevel] = useState(
    currentUserMinerLevel
  );

  // Get selected miner from all_miners - only recompute when dependencies change
  const selectedMiner = useMemo(
    () =>
      all_miners.find((m) => m._id === `LEVEL_${selectedMinerLevel}`) ||
      current_miner,
    [selectedMinerLevel, all_miners, current_miner]
  );

  const handleLevelSelect = useCallback((level: number) => {
    setSelectedMinerLevel(level);
  }, []);

  const handleUpgrade = () => {
    // TODO: Backend'e upgrade isteği gönder (level artacak)
    console.log("Upgrading miner to level", selectedMinerLevel);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

      {/* Content container */}
      <div className="relative container mx-auto px-4 py-1">
        {/* Main content */}
        <div className="flex flex-col items-center justify-start">
          {/* Level thumbnails */}
          <MinerLevelThumbnails
            currentLevel={currentUserMinerLevel}
            selectedLevel={selectedMinerLevel}
            maxLevel={5}
            onLevelSelect={handleLevelSelect}
          />

          {/* Miner display */}
          <div className="">
            <MinerDisplay
              selectedMiner={selectedMiner}
              currentUserMinerLevel={currentUserMinerLevel}
            />
          </div>

          {/* Mining progress - show reward for all levels, but progress only for current level */}
          <div className="mt-4 w-full">
            <MineButton
              hourlyReward={selectedMiner.profit_per_hour}
              rewardType={selectedMiner.reward_type}
              showProgress={selectedMinerLevel === currentUserMinerLevel}
            />
          </div>

          {/* Upgrade button - show for next level miners */}
          <div className="mt-4 w-full">
            <MinerUpgradeButton
              selectedMiner={selectedMiner}
              currentUserMinerLevel={currentUserMinerLevel}
              onUpgrade={handleUpgrade}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
