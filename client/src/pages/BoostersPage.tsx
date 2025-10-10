import { useState } from "react";
import { HourlyEarnings } from "../components/boosters/HourlyEarnings";
import { BoostersList } from "../components/boosters/BoostersList";
import { Booster } from "../components/boosters/BoosterCard";

export const BoostersPage = () => {
  // TODO: Bu veriler Redux'tan gelecek
  const [userStones, setUserStones] = useState(50000);

  const [boosters, setBoosters] = useState<Booster[]>([
    {
      id: "auto-miner",
      name: "Auto Miner",
      description: "Automatically mines stones for you",
      icon: "⛏️",
      level: 3,
      maxLevel: 10,
      isLocked: false,
      unlockCost: 1000,
      upgradeCost: 5000,
      baseEarnings: 100,
      currentEarnings: 300,
      nextLevelEarnings: 400,
    },
    {
      id: "mining-rig",
      name: "Mining Rig",
      description: "Advanced mining equipment",
      icon: "🏭",
      level: 2,
      maxLevel: 10,
      isLocked: false,
      unlockCost: 5000,
      upgradeCost: 12000,
      baseEarnings: 250,
      currentEarnings: 500,
      nextLevelEarnings: 750,
    },
    {
      id: "energy-boost",
      name: "Energy Boost",
      description: "Increases mining efficiency",
      icon: "⚡",
      level: 1,
      maxLevel: 10,
      isLocked: false,
      unlockCost: 3000,
      upgradeCost: 8000,
      baseEarnings: 150,
      currentEarnings: 150,
      nextLevelEarnings: 300,
    },
    {
      id: "quantum-chip",
      name: "Quantum Chip",
      description: "Cutting-edge mining technology",
      icon: "💎",
      level: 0,
      maxLevel: 10,
      isLocked: true,
      unlockCost: 10000,
      upgradeCost: 15000,
      baseEarnings: 500,
      currentEarnings: 0,
      nextLevelEarnings: 500,
    },
    {
      id: "ai-optimizer",
      name: "AI Optimizer",
      description: "AI-powered mining optimization",
      icon: "🤖",
      level: 0,
      maxLevel: 10,
      isLocked: true,
      unlockCost: 25000,
      upgradeCost: 30000,
      baseEarnings: 1000,
      currentEarnings: 0,
      nextLevelEarnings: 1000,
    },
    {
      id: "space-station",
      name: "Space Station",
      description: "Mine from orbit",
      icon: "🛸",
      level: 0,
      maxLevel: 10,
      isLocked: true,
      unlockCost: 50000,
      upgradeCost: 60000,
      baseEarnings: 2000,
      currentEarnings: 0,
      nextLevelEarnings: 2000,
    },
  ]);

  // Calculate total hourly earnings
  const calculateHourlyRate = () => {
    return boosters.reduce((total, booster) => {
      if (!booster.isLocked) {
        return total + booster.currentEarnings;
      }
      return total;
    }, 0);
  };

  const hourlyRate = calculateHourlyRate();
  const totalEarned24h = hourlyRate * 24;

  const handleUnlock = (boosterId: string) => {
    const booster = boosters.find((b) => b.id === boosterId);
    if (!booster || !booster.isLocked) return;

    if (userStones >= booster.unlockCost) {
      setBoosters(
        boosters.map((b) =>
          b.id === boosterId
            ? {
                ...b,
                isLocked: false,
                level: 1,
                currentEarnings: b.baseEarnings,
              }
            : b
        )
      );
      setUserStones(userStones - booster.unlockCost);
    }
  };

  const handleUpgrade = (boosterId: string) => {
    const booster = boosters.find((b) => b.id === boosterId);
    if (!booster || booster.isLocked || booster.level >= booster.maxLevel)
      return;

    if (userStones >= booster.upgradeCost) {
      setBoosters(
        boosters.map((b) =>
          b.id === boosterId
            ? {
                ...b,
                level: b.level + 1,
                currentEarnings: b.nextLevelEarnings,
                nextLevelEarnings: b.nextLevelEarnings + b.baseEarnings,
                upgradeCost: Math.floor(b.upgradeCost * 1.5),
              }
            : b
        )
      );
      setUserStones(userStones - booster.upgradeCost);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

      {/* Content container */}
      <div className="relative container mx-auto px-4 py-2 max-w-2xl">
        {/* Hourly Earnings Display */}
        <HourlyEarnings
          hourlyRate={hourlyRate}
          totalEarned24h={totalEarned24h}
        />

        {/* Boosters List */}
        <BoostersList
          boosters={boosters}
          userStones={userStones}
          onUnlock={handleUnlock}
          onUpgrade={handleUpgrade}
        />
      </div>
    </div>
  );
};
