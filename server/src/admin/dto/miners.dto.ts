import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EMinerLevel, EMinerRewardType } from 'src/common/enums/miners.enum';

export class CreateMinerDto {
  @IsEnum(EMinerLevel)
  _id: EMinerLevel;

  @IsEnum(EMinerRewardType)
  reward_type: EMinerRewardType;

  @IsNumber()
  profit_per_hour: number;

  @IsNumber()
  stone_price_to_upgrade: number;
}
