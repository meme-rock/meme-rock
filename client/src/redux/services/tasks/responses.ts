import { EUserTaskStatus } from "../../../types/enums";

export interface BalanceData {
  stone: number;
  dust: number;
}

export interface VerifyDailyTaskResponse {
  task: {
    _id: string;
    status: EUserTaskStatus;
  };
}
export interface ClaimDailyTaskResponse {
  balance: BalanceData;
  task: {
    _id: string;
    status: EUserTaskStatus;
  };
}
