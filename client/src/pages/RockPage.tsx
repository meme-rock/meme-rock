import { useState, useEffect } from "react";
import { HiltiLevelThumbnails } from "../components/rock/HiltiLevelThumbnail";
import { HiltiDisplay } from "../components/rock/HiltiDisplay";
import { MineButton } from "../components/main/MineButton";
import { UpgradeRequirements } from "../components/main/UpgradeRequirements";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const RockPage = () => {
  const miner = useSelector((state: RootState) => state.miner);
  console.log("miner: ", miner);
  // TODO: Bu veriler Redux'tan gelecek
  const currentLevel = Number(miner._id.split("_")[1]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Mine button handler
  const handleMine = () => {
    if (cooldownRemaining > 0) return;

    // TODO: Backend'e mine isteği gönder

    // Start 24 hour cooldown
    setCooldownRemaining(86400); // 24 hours in seconds
  };

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // TODO: Bu veriler Redux'tan gelecek - miner data ve user stones_spent
  const stonesSpent = 45000; // Kullanıcının harcadığı toplam stone (dummy data)
  const spent_stones_to_upgrade = miner.spent_stones_to_upgrade; // Level 2 için gerekli stone (miner.spent_stones_to_upgrade)

  const handleUpgrade = () => {
    const canUpgrade = stonesSpent >= spent_stones_to_upgrade;
    if (!canUpgrade) return;

    // TODO: Backend'e upgrade isteği gönder (level artacak)
    console.log("Upgrading to level", currentLevel + 1);
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
          <HiltiLevelThumbnails currentLevel={currentLevel} maxLevel={5} />

          {/* Miner display */}
          <div className="mt-2">
            <HiltiDisplay level={currentLevel} />
          </div>

          {/* Mine button */}
          <div className="mt-4">
            <MineButton
              onMine={handleMine}
              reward={miner.stones_income}
              cooldownRemaining={cooldownRemaining}
            />
          </div>

          {/* Upgrade requirements */}
          <div className="w-full px-4">
            <UpgradeRequirements
              nextLevel={currentLevel + 1}
              stonesSpent={stonesSpent}
              spent_stones_to_upgrade={spent_stones_to_upgrade}
              canUpgrade={stonesSpent >= spent_stones_to_upgrade}
              onUpgrade={handleUpgrade}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
