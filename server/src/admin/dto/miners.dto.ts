import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EMinerLevel } from 'src/common/enums/miners.enum';

export class CreateMinerDto {
  @IsEnum(EMinerLevel)
  _id: EMinerLevel;

  @IsNumber()
  stones_income: number;

  @IsObject()
  upgrade_requirements: Record<string, any>;

  @IsNumber()
  spent_stones_to_upgrade: number;
}
