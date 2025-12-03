import { IHiltiDetail, IMinerDetail, IUser } from "../../../types";
import {
  ETaskAPIType,
  ETaskIcon,
  ETaskType,
  ETaskDailyMatch,
  EUserTaskStatus,
} from "../../../types/enums";

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

export interface LoadingResponse {
  user: IUser;
  hiltis: IHiltiDetail[];
  miners: IMinerDetail[];
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    stone_reward?: number;
    is_claimed: boolean;
    claimed_at?: string;
  }>;
  daily_reward: Array<{
    day: number;
    reward: number;
    dust_price: number;
  }>;
  tasks: Array<{
    _id: string;
    task_type: ETaskType;
    title: string;
    daily_task_match?: ETaskDailyMatch;
    limit?: number;
    link?: string;
    icon?: ETaskIcon;
    api_type: ETaskAPIType;
    reward: number;

    createdAt: Date;
    updatedAt: Date;
    status: EUserTaskStatus;
    remaining_seconds?: number;
  }>;
  premium_market_item?: {
    ton_price: number;
    stars_price: number;
  };
  mine_claim?: {
    success: boolean;
    claimed_reward: number;
    reward_type: string;
    periods_claimed: number;
    last_mine?: string;
    next_mine: string;
    mining_cooldown_ms: number;
    message: string;
    new_stone_balance?: number;
    new_dust_balance?: number;
    new_last_mine?: string;
  } | null;
  message: string;
}
