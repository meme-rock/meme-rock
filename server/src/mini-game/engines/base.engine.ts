import { MiniGameConfigDocument } from 'src/schemas/mini-games';

/**
 * Base interface for all mini-game engines.
 * Each game implements this to plug into the generic MiniGameService.
 */
export interface GameEngine {
  /** Load configuration from DB config document */
  loadConfig(config: MiniGameConfigDocument): void;

  /** Return default game_data for a brand-new state */
  getDefaultGameData(): Record<string, any>;

  /** Generate session payload (e.g. rock sequence for drill) */
  generateSession(
    playsLeft: number,
    gameData: Record<string, any>,
  ): { sessionPayload: Record<string, any>; clientPayload: Record<string, any> };

  /** Validate & settle a completed session. Returns rewards + updated game_data fields. */
  settleSession(
    session: Record<string, any>,
    gameData: Record<string, any>,
    clientReport: Record<string, any>,
  ): {
    rewards: { stones: number; rock_coins: number; [key: string]: number };
    playsUsed: number;
    gameDataInc: Record<string, number>;
    gameDataSet: Record<string, any>;
  };

  /** Calculate upgrade cost. Returns null if invalid. */
  calculateUpgradeCost(
    upgradeId: string,
    currentLevel: number,
  ): number | null;
}
