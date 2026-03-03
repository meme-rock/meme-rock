// ── Drill Game Economy Types & Constants ──

export interface DrillUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
}

export interface DrillGameState {
  remainingRocks: number;
  drillCoins: number;
  upgradeLevels: Record<string, number>;
  adsWatchedToday: number;
  lastResetDate: string; // YYYY-MM-DD
  totalRocksSmashed: number;
}

export interface DrillReward {
  type: "stone" | "rock_coin" | "drill_coin";
  amount: number;
}

export interface DrillEngineConfig {
  drillPower: number;
  comboSpeed: number;
  totalRocksSmashed: number;
}

// ── Constants ──

export const DAILY_ROCKS = 20;
export const ROCKS_PER_AD = 5;
export const MAX_ADS_PER_DAY = 5;
export const MAX_UPGRADE_LEVEL = 10;

// ── Upgrade Definitions ──

export const DRILL_UPGRADES: DrillUpgrade[] = [
  {
    id: "drill_power",
    name: "Drill Power",
    description: "+1 damage per level",
    icon: "\u26CF",
    maxLevel: MAX_UPGRADE_LEVEL,
    baseCost: 10,
    costMultiplier: 1.8,
  },
  {
    id: "lucky_strike",
    name: "Lucky Strike",
    description: "+5% coin chance per level",
    icon: "\u2728",
    maxLevel: MAX_UPGRADE_LEVEL,
    baseCost: 15,
    costMultiplier: 1.9,
  },
  {
    id: "stone_refinery",
    name: "Stone Refinery",
    description: "+1 stone reward per level",
    icon: "\uD83D\uDC8E",
    maxLevel: MAX_UPGRADE_LEVEL,
    baseCost: 20,
    costMultiplier: 2.0,
  },
  {
    id: "mineral_scanner",
    name: "Mineral Scanner",
    description: "+2% rock coin chance per level",
    icon: "\uD83D\uDD2C",
    maxLevel: MAX_UPGRADE_LEVEL,
    baseCost: 50,
    costMultiplier: 2.2,
  },
  {
    id: "rapid_fire",
    name: "Rapid Fire",
    description: "+0.5 combo speed per level",
    icon: "\u26A1",
    maxLevel: MAX_UPGRADE_LEVEL,
    baseCost: 25,
    costMultiplier: 1.7,
  },
];

// ── Helper Functions ──

export function getUpgradeCost(upgrade: DrillUpgrade, currentLevel: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}

export function getRockHP(totalRocksSmashed: number): number {
  return Math.min(300, 80 + totalRocksSmashed * 3);
}

export function calculateDamage(drillPowerLevel: number, combo: number): number {
  return (1 + drillPowerLevel) + Math.floor(combo / 10);
}

export function calculateRewards(
  totalRocksSmashed: number,
  stoneRefineryLevel: number,
  mineralScannerLevel: number
): DrillReward[] {
  const rewards: DrillReward[] = [];

  // DrillCoin always drops
  rewards.push({
    type: "drill_coin",
    amount: 1 + Math.floor(totalRocksSmashed / 10),
  });

  // Stone drop: 60% chance
  if (Math.random() < 0.6) {
    const stoneAmount = Math.floor(Math.random() * 3) + 1 + stoneRefineryLevel;
    rewards.push({ type: "stone", amount: stoneAmount });
  }

  // Rock Coin drop: 5% + (mineralScannerLevel * 2)% chance
  const rockCoinChance = 0.05 + mineralScannerLevel * 0.02;
  if (Math.random() < rockCoinChance) {
    rewards.push({ type: "rock_coin", amount: 1 });
  }

  return rewards;
}
