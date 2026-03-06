export interface RockSequenceItem {
  type: "COMMON" | "RARE" | "LEGENDARY";
  hp: number;
  rewards: { type: string; amount: number }[];
}

export interface UpgradeDefFromAPI {
  id: string;
  name: string;
  description: string;
  icon: string;
  base_cost: number;
  cost_multiplier: number;
}

export interface MiniGameConfigFromAPI {
  daily_plays: number;
  max_ads_per_day: number;
  plays_per_ad: number;
  max_upgrade_level: number;
  upgrades: UpgradeDefFromAPI[];
}

export interface MiniGameStateResponse {
  success: boolean;
  data: {
    daily_plays_left: number;
    ads_watched_today: number;
    game_data: {
      drill_coins: number;
      upgrade_levels: Record<string, number>;
      total_rocks_smashed: number;
    };
    has_active_session: boolean;
    config: MiniGameConfigFromAPI;
  };
}

export interface StartSessionResponse {
  success: boolean;
  data: {
    session_id: string;
    rock_sequence: RockSequenceItem[];
    upgrade_levels: Record<string, number>;
    drill_coins: number;
  };
}

export interface EndSessionResponse {
  success: boolean;
  data: {
    rewards: {
      stones: number;
      rock_coins: number;
      drill_coins: number;
    };
    new_state: {
      daily_plays_left: number;
      ads_watched_today: number;
      game_data: {
        drill_coins: number;
        upgrade_levels: Record<string, number>;
        total_rocks_smashed: number;
      };
      has_active_session: boolean;
    };
  };
}

export interface UpgradeResponse {
  success: boolean;
  data: {
    new_level: number;
    new_drill_coins: number;
    upgrade_levels: Record<string, number>;
  };
}

export interface AdRewardResponse {
  success: boolean;
  data: {
    daily_plays_left: number;
    ads_watched_today: number;
  };
}

export interface MiniGameCatalogItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  is_locked: boolean;
  description: string;
}

export interface MiniGameCatalogResponse {
  success: boolean;
  data: MiniGameCatalogItem[];
}
