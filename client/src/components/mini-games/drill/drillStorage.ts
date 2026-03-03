import { DrillGameState, DAILY_ROCKS } from "./drillTypes";

const STORAGE_KEY = "meme-rock-drill-state";

function getToday(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function createDefaultState(): DrillGameState {
  return {
    remainingRocks: DAILY_ROCKS,
    drillCoins: 0,
    upgradeLevels: {},
    adsWatchedToday: 0,
    lastResetDate: getToday(),
    totalRocksSmashed: 0,
  };
}

function resetDailyIfNeeded(state: DrillGameState): DrillGameState {
  const today = getToday();
  if (state.lastResetDate !== today) {
    return {
      ...state,
      remainingRocks: DAILY_ROCKS,
      adsWatchedToday: 0,
      lastResetDate: today,
    };
  }
  return state;
}

export function loadDrillState(): DrillGameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed: DrillGameState = JSON.parse(raw);
    return resetDailyIfNeeded(parsed);
  } catch {
    return createDefaultState();
  }
}

export function saveDrillState(state: DrillGameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
