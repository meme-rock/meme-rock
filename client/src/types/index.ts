import { EHiltiLevel, EUserTaskStatus } from "./enums";

export interface ITelegramData {
  username: string;
  language_code: string;
  first_name: string;
  last_name: string;
  is_telegram_premium: boolean;
  photo_url: string;
  allows_write_to_pm: boolean;
}

export interface IMinerData {
  miner: string;
  last_mine: Date;
}

export interface IHiltiDetail {
  _id: EHiltiLevel;
  rock_income: number;
  upgrade_requirements?: {
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface IHiltiData {
  hilti: string;
  last_claim: Date;
}

export interface IUserHiltiState {
  current_hilti: IHiltiDetail;
  last_claim: Date;
  all_hiltis: IHiltiDetail[];
}

export interface IUserBooster {
  booster_id: string;
  current_level: number;
  unlocked_at?: Date;
  last_upgraded_at?: Date;
}

export interface IGameData {
  stones: number;
  dust: number;
  spent_dust: number;
  spent_stone: number;
  profit_per_hour: number;
  is_premium: boolean;
  auto_collector: boolean;
  miner_data: IMinerData;
  hilti_data: IHiltiData;
  boosters: IUserBooster[];
}

export interface IAirdropData {
  rock_coins: number;
  wallet_address: string | null;
}

export interface IUser {
  __v: number;
  _id: string;
  invited_by: string | null;
  invite_count: number;
  createdAt: string;
  updatedAt: string;
  telegram_data: ITelegramData;
  game_data: IGameData;
  airdrop_data: IAirdropData;
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
    stone_pay?: number;
    [key: string]: string | number | undefined;
  };
  level_data: IBoosterLevelData[];
  image_url: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  is_unlocked: boolean;
  current_level: number;
}
