import { useState, useEffect } from "react";
import { MinerLevelThumbnails } from "../components/main/MinerLevelThumbnails";
import { MinerDisplay } from "../components/main/MinerDisplay";
import { MineButton } from "../components/main/MineButton";
import { UpgradeRequirements } from "../components/main/UpgradeRequirements";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const MainPage = () => {
  const miner_data = useSelector((state: RootState) => state.miner);
  console.log("minerrr: ", miner_data);
  // TODO: Bu veriler Redux'tan gelecek
  const currentLevel = Number(miner_data.miner._id.split("_")[1]);
  const upgrade_requirements = miner_data.miner.upgrade_requirements || {};

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
  const spent_stones_to_upgrade = miner_data.miner.spent_stones_to_upgrade; // Level 2 için gerekli stone (miner.spent_stones_to_upgrade)

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
          <MinerLevelThumbnails currentLevel={currentLevel} maxLevel={5} />

          {/* Miner display */}
          <div className="mt-2">
            <MinerDisplay level={currentLevel} />
          </div>

          {/* Mine button */}
          <div className="mt-4">
            <MineButton
              onMine={handleMine}
              reward={miner_data.miner.stones_income}
              cooldownRemaining={cooldownRemaining}
            />
          </div>

          {/* Upgrade requirements */}
          {currentLevel < 5 && (
            <div className="w-full px-4">
              <UpgradeRequirements
                nextLevel={currentLevel + 1}
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
