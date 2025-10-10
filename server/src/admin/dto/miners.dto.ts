import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EMinerLevel } from 'src/common/enums/miners.enum';

export class CreateMinerDto {
  @IsEnum(EMinerLevel)
  level: EMinerLevel;

  @IsNumber()
  stones_income: number;

  @IsNumber()
  spent_stones_to_upgrade: number;
}
