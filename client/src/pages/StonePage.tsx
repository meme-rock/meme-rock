import { useState, useMemo, useCallback } from "react";
import { MinerLevelThumbnails } from "../components/stone/MinerLevelThumbnails";
import { MinerDisplay } from "../components/stone/MinerDisplay";
import { MineButton } from "../components/stone/MineButton";
import { UpgradeRequirements } from "../components/stone/UpgradeRequirements";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../redux/store";

export const StonePage = () => {
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

  const upgrade_requirements = useMemo(
    () => current_miner.upgrade_requirements || {},
    [current_miner.upgrade_requirements]
  );

  const handleLevelSelect = useCallback((level: number) => {
    setSelectedMinerLevel(level);
  }, []);

  // TODO: Bu veriler Redux'tan gelecek - miner data ve user stones_spent
  const stonesSpent = 45000; // Kullanıcının harcadığı toplam stone (dummy data)
  const spent_stones_to_upgrade = current_miner.spent_stones_to_upgrade; // Level 2 için gerekli stone (miner.spent_stones_to_upgrade)

  const handleUpgrade = () => {
    const canUpgrade = stonesSpent >= spent_stones_to_upgrade;
    if (!canUpgrade) return;

    // TODO: Backend'e upgrade isteği gönder (level artacak)
    console.log("Upgrading to level", selectedMinerLevel + 1);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

      {/* Content container */}
      <div className="relative container mx-auto px-4 py-1">
        {/* Main content */}
        <div className="flex flex-col items-center justify-start pt-2">
          {/* Level thumbnails */}
          <MinerLevelThumbnails
            currentLevel={currentUserMinerLevel}
            selectedLevel={selectedMinerLevel}
            maxLevel={5}
            onLevelSelect={handleLevelSelect}
          />

          {/* Miner display */}
          <div className="mt-2">
            <MinerDisplay
              selectedMiner={selectedMiner}
              currentUserMinerLevel={currentUserMinerLevel}
            />
          </div>

          {/* Mine button - show reward for all levels, but button only for current level */}
          <div className="mt-4">
            <MineButton
              reward={selectedMiner.stones_income}
              showButton={selectedMinerLevel === currentUserMinerLevel}
            />
          </div>

          {/* Upgrade requirements */}
          {selectedMinerLevel < 5 && (
            <div className="w-full px-4">
              <UpgradeRequirements
                nextLevel={selectedMinerLevel + 1}
                inviteCount={7} // Kullanıcının yaptığı davet sayısı
                requiredInvites={upgrade_requirements.invite || 0} // Gerekli davet sayısı
                dustSpent={999} // Harcanan dust
                requiredDust={upgrade_requirements.spend_dust || 0} // Gerekli dust
                stonesSpent={1000} // Harcanan stone
                requiredStones={upgrade_requirements.spend_stone || 0} // Gerekli stone
                canUpgrade={true}
                onUpgrade={handleUpgrade}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
