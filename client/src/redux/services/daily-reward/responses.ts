interface BalanceData {
  stone: number;
  dust: number;
}
export interface DailyRewardData {
  day: number;
  last_claim_date: string;
}
export interface DailyRewardResponse {
  daily_reward_data: DailyRewardData;
  balance: BalanceData;
}
