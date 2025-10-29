import {
  IsEnum,
  IsNumber,
  IsNotEmpty, // lastEnergyRefill'in client tarafından gönderilmesi opsiyonel ise (service handle edecekse)
} from 'class-validator';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';

export class CreateHiltiDto {
  @IsNotEmpty()
  @IsEnum(EHiltiLevel)
  _id: EHiltiLevel;

  @IsNumber()
  @IsNotEmpty()
  profit_per_hour: number;

  @IsNumber()
  profit_per_hour_to_upgrade: number;

  @IsNumber()
  stone_price_to_upgrade: number;
}
