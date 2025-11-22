import { IHiltiDetail } from "../../../types";

export interface UpgradeResponse {
  success: boolean;
  data: {
    new_hilti_level: string;
    new_stone_balance: number;
    new_profit_per_hour: number;
    hilti: IHiltiDetail;
  };
}
