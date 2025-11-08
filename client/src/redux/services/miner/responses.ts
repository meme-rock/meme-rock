export interface BalanceData {
  stone: number;
  dust: number;
}

export interface MineResponse {
  success: boolean;
  message: string;
  balance_data: BalanceData;
  miner_data: {
    last_mine: string;
    next_mine: string;
    max_periods: number;
    claimable_periods: number;
  };
}
