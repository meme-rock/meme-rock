// ── Drill Game Economy Types & Constants ──

export interface DrillUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  costMultiplier: number;
}

export interface DrillReward {
  type: "stone" | "rock_coin" | "drill_coin";
  amount: number;
}

export interface DrillEngineConfig {
  drillPower: number;
  comboSpeed: number;
}

// ── Rock Types ──

export type RockType = "COMMON" | "RARE" | "LEGENDARY";

export interface RockColorPalette {
  shadow: number;
  darkBase: number;
  midTone: number;
  upperSurface: number;
  topHighlight: number;
  specular1: number;
  specular2: number;
  specular3: number;
  vein1: number;
  vein2: number;
  vein3: number;
  crystal: number;
  crystalFace: number;
  crystalHighlight: number;
  crystalGlow: number;
  outline: number;
  damageTint: number;
  crackGlow: number;
  crackGlowInner: number;
}

export const ROCK_PALETTES: Record<RockType, RockColorPalette> = {
  COMMON: {
    shadow: 0x0e1420,
    darkBase: 0x1a2235,
    midTone: 0x2d3a50,
    upperSurface: 0x3d4e68,
    topHighlight: 0x4a607e,
    specular1: 0x5a7898,
    specular2: 0x7090b5,
    specular3: 0x90b0d0,
    vein1: 0x2a5a9a,
    vein2: 0x2a5a9a,
    vein3: 0x3070b0,
    crystal: 0x3a7bd5,
    crystalFace: 0x5a9ae0,
    crystalHighlight: 0x8ac4ff,
    crystalGlow: 0x5a9ae0,
    outline: 0x0a0f18,
    damageTint: 0x88443a,
    crackGlow: 0x3a7bd5,
    crackGlowInner: 0x8ab8e8,
  },
  RARE: {
    shadow: 0x1a1408,
    darkBase: 0x2a2210,
    midTone: 0x4a3a18,
    upperSurface: 0x6a5420,
    topHighlight: 0x8a7030,
    specular1: 0xa08840,
    specular2: 0xc0a850,
    specular3: 0xe0c870,
    vein1: 0xd4a017,
    vein2: 0xd4a017,
    vein3: 0xf0c040,
    crystal: 0xffd700,
    crystalFace: 0xffe44d,
    crystalHighlight: 0xfff0a0,
    crystalGlow: 0xffd700,
    outline: 0x1a1408,
    damageTint: 0x886a3a,
    crackGlow: 0xffd700,
    crackGlowInner: 0xfff0a0,
  },
  LEGENDARY: {
    shadow: 0x1a0808,
    darkBase: 0x2a1010,
    midTone: 0x4a1818,
    upperSurface: 0x6a2020,
    topHighlight: 0x8a3030,
    specular1: 0xa04040,
    specular2: 0xc05050,
    specular3: 0xe06060,
    vein1: 0xcc2200,
    vein2: 0xcc2200,
    vein3: 0xff4400,
    crystal: 0xff4500,
    crystalFace: 0xff6a40,
    crystalHighlight: 0xffa080,
    crystalGlow: 0xff4500,
    outline: 0x1a0808,
    damageTint: 0x883a3a,
    crackGlow: 0xff4500,
    crackGlowInner: 0xffa080,
  },
};

// ── Helper Functions ──

export function getUpgradeCost(baseCost: number, costMultiplier: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
}

export function calculateDamage(drillPowerLevel: number, combo: number): number {
  return (1 + drillPowerLevel) + Math.floor(combo / 10);
}
