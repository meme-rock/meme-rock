export const DRILL_CATALOG_SEED = {
  _id: 'DRILL',
  title: 'Rock Drill',
  icon: '\u26CF\uFE0F',
  path: '/mini-games/drill',
  is_locked: false,
  sort_order: 0,
  description: 'Drill through rocks to earn coins and rewards!',
};

export const DRILL_CONFIG_SEED = {
  _id: 'DRILL',
  daily_plays: 20,
  max_ads_per_day: 5,
  plays_per_ad: 5,
  max_upgrade_level: 10,
  upgrade_currency_field: 'drill_coins',
  upgrades: [
    {
      id: 'drill_power',
      name: 'Drill Power',
      description: '+1 damage per level',
      icon: '\u26CF',
      base_cost: 10,
      cost_multiplier: 1.8,
    },
    {
      id: 'lucky_strike',
      name: 'Lucky Strike',
      description: '+5% coin chance per level',
      icon: '\u2728',
      base_cost: 15,
      cost_multiplier: 1.9,
    },
    {
      id: 'stone_refinery',
      name: 'Stone Refinery',
      description: '+1 stone reward per level',
      icon: '\uD83D\uDC8E',
      base_cost: 20,
      cost_multiplier: 2.0,
    },
    {
      id: 'mineral_scanner',
      name: 'Mineral Scanner',
      description: '+2% rock coin chance per level',
      icon: '\uD83D\uDD2C',
      base_cost: 50,
      cost_multiplier: 2.2,
    },
    {
      id: 'rapid_fire',
      name: 'Rapid Fire',
      description: '+0.5 combo speed per level',
      icon: '\u26A1',
      base_cost: 25,
      cost_multiplier: 1.7,
    },
  ],
  game_constants: {
    base_hp: 80,
    rock_types: {
      COMMON: { weight: 70, hpMult: 1.0, rewardMult: 1.0 },
      RARE: { weight: 25, hpMult: 1.8, rewardMult: 2.5 },
      LEGENDARY: { weight: 5, hpMult: 3.0, rewardMult: 6.0 },
    },
  },
};
