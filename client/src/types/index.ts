import { EMinerLevel, EUserTaskStatus } from "./enums";

export interface ITelegramData {
  username: string;
  language_code: string;
  first_name: string;
  last_name: string;
  is_telegram_premium: boolean;
  photo_url: string;
  allows_write_to_pm: boolean;
}

export interface IGameData {
  stones: number;
  level: number;
  profit_per_hour: number;
  is_premium: boolean;
  auto_collector: boolean;
}

export interface IUserCards {
  owner_id: string;
  card_id: string;
  level: number;
  level_up_price: number;
  profit: number;
}

export interface IUser {
  __v: number;
  _id: string;
  telegram_data: ITelegramData;
  game_data: IGameData;
  userCards: IUserCards[];
  invited_by: string | null;
  invite_count: number;
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

export interface ICardCategory {
  _id: string;
  title: string;
}

export interface ICard {
  _id: string;
  title: string;
  level?: number;
  max_level: number;
  image_url: string;
  profit_per_hour: number;
  level_up_price: number;
  level_up_multiplier: number;
  card_category: ICardCategory | string;
  requirements: string | null;
  createdAt: string;
  updatedAt: string;
  is_unlocked: boolean;
  __v?: number;
}

export interface IBooster {
  _id: string;
  title: string;
  stars_price: number;
  image_url: string;
  profit_per_hour: number;
  createdAt: string;
  updatedAt: string;
  is_unlocked: boolean;
  __v?: number;
}

export interface IMiner {
  _id: EMinerLevel;
  stones_income: number;
  spent_stones_to_upgrade: number;
}
