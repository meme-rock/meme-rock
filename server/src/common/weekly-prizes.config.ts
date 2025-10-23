export interface WeeklyPrizeConfig {
  rank: number;
  stoneReward: number;
}

export const WEEKLY_PRIZES: WeeklyPrizeConfig[] = [
  {
    rank: 1,
    stoneReward: 5000,
  },
  {
    rank: 2,
    stoneReward: 2500,
  },
  {
    rank: 3,
    stoneReward: 1250,
  },
  {
    rank: 4,
    stoneReward: 500,
  },
  {
    rank: 5,
    stoneReward: 250,
  },
];

export function getWeeklyPrize(rank: number): number {
  const prize = WEEKLY_PRIZES.find((p) => p.rank === rank);
  return prize ? prize.stoneReward : 0;
}
