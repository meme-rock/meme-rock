interface BalanceData {
  stone: number;
  dust: number;
}

interface AdData {
  ads_watched_total: number;
  ads_watched_daily: number;
}

export interface AfterAdRewardResponse {
  balance: BalanceData;
  ad_data: AdData;
}
