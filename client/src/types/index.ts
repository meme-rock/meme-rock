import {
  EHiltiLevel,
  EMinerLevel,
  EMinerRewardType,
  EUserTaskStatus,
} from "./enums";

export interface ITelegramData {
  username: string;
  language_code: string;
  first_name: string;
  last_name: string;
  is_telegram_premium: boolean;
  photo_url: string;
  allows_write_to_pm: boolean;
}

export interface IBalanceData {
  stone: number;
  dust: number;
}

export interface IPaymentData {
  total_star_payment: number;
  total_ton_payment: number;
  last_payment_date: Date;
}

export interface IAirdropData {
  rock_coins: number;
  wallet_address: string | null;
  profit_per_hour: number;
}

export interface IAdData {
  ads_watched: number;
  last_ad_watched: Date;
  ads_watched_today: number;
}

export interface IMinerDetail {
  _id: EMinerLevel;
  reward_type: EMinerRewardType;
  profit_per_hour: number;
  stone_price_to_upgrade: number;
}

export interface IMinerData {
  miner: IMinerDetail;
  last_mine: Date;
}

export interface IUserMinerState {
  current_miner: IMinerDetail;
  all_miners: IMinerDetail[];
}

export interface IHiltiDetail {
  _id: EHiltiLevel;
  profit_per_hour: number;
  profit_per_hour_to_upgrade?: number;
  stone_price_to_upgrade?: number;
  upgrade_requirements?: {
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface IHiltiData {
  hilti: IHiltiDetail;
}

export interface IUserHiltiState {
  current_hilti: IHiltiDetail;
  all_hiltis: IHiltiDetail[];
}

export interface IUserBooster {
  booster_id: string;
  current_level: number;
}

export interface IAchievement {
  achievement_id: string;
  claimed_at?: string;
}

export interface IUser {
  __v: number;
  _id: string;
  telegram_data: ITelegramData;
  balance_data: IBalanceData;
  payment_data: IPaymentData;
  airdrop_data: IAirdropData;
  ad_data: IAdData;
  miner_data: IMinerData;
  hilti_data: IHiltiData;
  boosters: IUserBooster[];
  achievements: IAchievement[];
  is_premium: boolean;
  invited_by: string | null;
  invite_count: number;
  created_at: string;
  last_online: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  task_url: string;
  reward: number;
  api_type: string;
  task_type: string;
  telegram_channel_id?: string;
  x_account_id?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  status: EUserTaskStatus;
}

export interface IBoosterLevelData {
  level: number;
  upgrade_cost: number;
  profit_per_hour: number;
}
[];

export interface IBooster {
  _id: string;
  title: string;
  required_hilti_level: EHiltiLevel | string;
  max_level: number;
  unlock_requirements: {
    stone?: number;
    dust?: number;
    invite?: number;
  };
  level_data: IBoosterLevelData[];
  image_url: string;
  is_unlocked: boolean;
  current_level: number;
}
