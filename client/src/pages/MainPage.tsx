import { useState, useEffect } from "react";
import { MinerLevelThumbnails } from "../components/main/MinerLevelThumbnails";
import { MinerDisplay } from "../components/main/MinerDisplay";
import { MineButton } from "../components/main/MineButton";
import { UpgradeRequirements } from "../components/main/UpgradeRequirements";

export const MainPage = () => {
  // TODO: Bu veriler Redux'tan gelecek
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userStones, setUserStones] = useState(50000);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Mine button handler
  const handleMine = () => {
    if (cooldownRemaining > 0) return;

    // Claim stones
    setUserStones((prev) => prev + 500);

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

  // Upgrade requirements for next level
  const upgradeRequirements = [
    {
      type: "stones" as const,
      label: "Collect Stones",
      current: userStones,
      required: 100000,
      completed: userStones >= 100000,
    },
    {
      type: "level" as const,
      label: "Complete Daily Tasks",
      current: 5,
      required: 10,
      completed: false,
    },
    {
      type: "task" as const,
      label: "Mining Streak",
      current: 3,
      required: 7,
      completed: false,
    },
  ];

  const handleUpgrade = () => {
    const canUpgrade = upgradeRequirements.every((req) => req.completed);
    if (!canUpgrade) return;

    setCurrentLevel((prev) => prev + 1);
    setUserStones((prev) => prev - 100000);
    // TODO: Backend'e upgrade isteği gönder
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
              reward={500}
              cooldownRemaining={cooldownRemaining}
            />
          </div>

          {/* Upgrade requirements */}
          <div className="w-full px-4">
            <UpgradeRequirements
              currentLevel={currentLevel}
              nextLevel={currentLevel + 1}
              requirements={upgradeRequirements}
              canUpgrade={upgradeRequirements.every((req) => req.completed)}
              onUpgrade={handleUpgrade}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
