import {
  IsEnum,
  IsNumber,
  IsObject,
  IsDateString, // Tarih için string formatında veri bekleneceğinden bunu kullanıyoruz
  IsOptional, // lastEnergyRefill'in client tarafından gönderilmesi opsiyonel ise (service handle edecekse)
} from 'class-validator';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';

export class CreateHiltiDto {
  @IsEnum(EHiltiLevel)
  _id: EHiltiLevel;

  @IsNumber()
  rock_income: number;

  @IsObject()
  upgrade_requirements: Record<string, any>;

  @IsNumber()
  max_energy: number;
}
