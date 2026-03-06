// ── Drill Mini-Game Engine (Server-Side) ──
// Implements GameEngine interface for the Rock Drill mini-game.

import { MiniGameConfigDocument } from 'src/schemas/mini-games';
import { GameEngine } from './base.engine';

// ── Types ──

export type RockType = 'COMMON' | 'RARE' | 'LEGENDARY';

interface RockTypeConfig {
  weight: number;
  hpMult: number;
  rewardMult: number;
}

interface UpgradeDef {
  id: string;
  baseCost: number;
  costMultiplier: number;
}

export interface RockReward {
  type: string;
  amount: number;
}

export interface RockSequenceItem {
  type: RockType;
  hp: number;
  rewards: RockReward[];
}

// ── DrillEngine class implementing GameEngine ──

export class DrillEngine implements GameEngine {
  private rockTypes: Record<string, RockTypeConfig> = {
    COMMON: { weight: 70, hpMult: 1.0, rewardMult: 1.0 },
    RARE: { weight: 25, hpMult: 1.8, rewardMult: 2.5 },
    LEGENDARY: { weight: 5, hpMult: 3.0, rewardMult: 6.0 },
  };
  private baseHp = 80;
  private upgrades: UpgradeDef[] = [];
  private maxUpgradeLevel = 10;

  loadConfig(config: MiniGameConfigDocument): void {
    const gc = config.game_constants || {};
    if (gc.rock_types) this.rockTypes = gc.rock_types;
    if (gc.base_hp) this.baseHp = gc.base_hp;
    this.maxUpgradeLevel = config.max_upgrade_level;
    this.upgrades = (config.upgrades || []).map((u) => ({
      id: u.id,
      baseCost: u.base_cost,
      costMultiplier: u.cost_multiplier,
    }));
  }

  getDefaultGameData(): Record<string, any> {
    return {
      drill_coins: 0,
      upgrade_levels: {},
      total_rocks_smashed: 0,
    };
  }

  generateSession(
    playsLeft: number,
    gameData: Record<string, any>,
  ): {
    sessionPayload: Record<string, any>;
    clientPayload: Record<string, any>;
  } {
    const upgradeLevels = gameData?.upgrade_levels || {};
    const totalRocksSmashed = gameData?.total_rocks_smashed || 0;

    const rockSequence = this.generateRockSequence(
      playsLeft,
      upgradeLevels,
      totalRocksSmashed,
    );
    const minimumTimeMs = this.calculateMinimumTimeMs(
      rockSequence,
      upgradeLevels,
    );

    const sessionPayload = {
      rock_sequence: rockSequence,
      minimum_time_ms: minimumTimeMs,
    };

    const clientPayload = {
      rock_sequence: rockSequence,
      upgrade_levels: upgradeLevels,
      drill_coins: gameData?.drill_coins || 0,
    };

    return { sessionPayload, clientPayload };
  }

  settleSession(
    session: Record<string, any>,
    _gameData: Record<string, any>,
    clientReport: Record<string, any>,
  ): {
    rewards: { stones: number; rock_coins: number; [key: string]: number };
    playsUsed: number;
    gameDataInc: Record<string, number>;
    gameDataSet: Record<string, any>;
  } {
    const rocksSmashed = clientReport.rocksSmashed || 0;
    const rockSequence: RockSequenceItem[] = session.rock_sequence || [];

    // Time validation
    const elapsed =
      Date.now() - new Date(session.started_at).getTime();
    if (elapsed < session.minimum_time_ms) {
      return {
        rewards: { stones: 0, rock_coins: 0, drill_coins: 0 },
        playsUsed: 0,
        gameDataInc: {},
        gameDataSet: {},
      };
    }

    const actualSmashed = Math.min(rocksSmashed, rockSequence.length);

    let totalStones = 0;
    let totalRockCoins = 0;
    let totalDrillCoins = 0;

    for (let i = 0; i < actualSmashed; i++) {
      const rock = rockSequence[i];
      for (const reward of rock.rewards) {
        if (reward.type === 'stone') totalStones += reward.amount;
        else if (reward.type === 'rock_coin') totalRockCoins += reward.amount;
        else if (reward.type === 'drill_coin') totalDrillCoins += reward.amount;
      }
    }

    return {
      rewards: {
        stones: totalStones,
        rock_coins: totalRockCoins,
        drill_coins: totalDrillCoins,
      },
      playsUsed: actualSmashed,
      gameDataInc: {
        drill_coins: totalDrillCoins,
        total_rocks_smashed: actualSmashed,
      },
      gameDataSet: {},
    };
  }

  calculateUpgradeCost(
    upgradeId: string,
    currentLevel: number,
  ): number | null {
    const upgrade = this.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return null;
    return Math.floor(
      upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel),
    );
  }

  // ── Private helpers ──

  private pickRockType(): RockType {
    const totalWeight = Object.values(this.rockTypes).reduce(
      (sum, t) => sum + t.weight,
      0,
    );
    let rand = Math.random() * totalWeight;
    for (const [type, config] of Object.entries(this.rockTypes)) {
      rand -= config.weight;
      if (rand <= 0) return type as RockType;
    }
    return 'COMMON';
  }

  private calculateRockRewards(
    rockType: RockType,
    upgradeLevels: Record<string, number>,
    totalRocksSmashed: number,
  ): RockReward[] {
    const rewards: RockReward[] = [];
    const mult = this.rockTypes[rockType]?.rewardMult ?? 1.0;
    const stoneRefineryLevel = upgradeLevels['stone_refinery'] || 0;
    const mineralScannerLevel = upgradeLevels['mineral_scanner'] || 0;

    // DrillCoin always drops
    const drillCoinAmount = Math.floor(
      (1 + Math.floor(totalRocksSmashed / 10)) * mult,
    );
    rewards.push({ type: 'drill_coin', amount: drillCoinAmount });

    // Stone drop: 60% chance
    if (Math.random() < 0.6) {
      const stoneAmount = Math.floor(
        (Math.floor(Math.random() * 3) + 1 + stoneRefineryLevel) * mult,
      );
      rewards.push({ type: 'stone', amount: stoneAmount });
    }

    // Rock Coin drop: 5% + (mineralScannerLevel * 2)% chance
    const rockCoinChance = 0.05 + mineralScannerLevel * 0.02;
    if (Math.random() < rockCoinChance) {
      const rockCoinAmount = Math.ceil(mult);
      rewards.push({ type: 'rock_coin', amount: rockCoinAmount });
    }

    return rewards;
  }

  private generateRockSequence(
    count: number,
    upgradeLevels: Record<string, number>,
    totalRocksSmashed: number,
  ): RockSequenceItem[] {
    const sequence: RockSequenceItem[] = [];

    for (let i = 0; i < count; i++) {
      const type = this.pickRockType();
      const typeMult = this.rockTypes[type]?.hpMult ?? 1.0;
      const hp = Math.floor(this.baseHp * typeMult * (1 + i * 0.15));
      const rewards = this.calculateRockRewards(
        type,
        upgradeLevels,
        totalRocksSmashed + i,
      );
      sequence.push({ type, hp, rewards });
    }

    return sequence;
  }

  private calculateMinimumTimeMs(
    sequence: RockSequenceItem[],
    upgradeLevels: Record<string, number>,
  ): number {
    const drillPowerLevel = upgradeLevels['drill_power'] || 0;
    const rapidFireLevel = upgradeLevels['rapid_fire'] || 0;

    const maxDamagePerHit = 1 + drillPowerLevel + 5;
    const tickThreshold = Math.max(1, 3 - rapidFireLevel * 0.5);
    const hitsPerSecond = 60 / tickThreshold;

    const maxDPS = maxDamagePerHit * hitsPerSecond;
    const totalHP = sequence.reduce((sum, r) => sum + r.hp, 0);

    const theoreticalTimeMs = (totalHP / maxDPS) * 1000;
    return Math.floor(theoreticalTimeMs * 0.7);
  }
}
