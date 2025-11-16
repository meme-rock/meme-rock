import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EBoosterUnlockCurrencyType } from 'src/common/enums/boosters.enum';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';

export class LevelDataDto {
  @IsNumber()
  level: number;

  @IsNumber()
  upgrade_cost: number;

  @IsNumber()
  profit_per_hour: number;
}
export class UnlockOptionsDto {
  @IsNotEmpty()
  @IsEnum(EBoosterUnlockCurrencyType)
  type: EBoosterUnlockCurrencyType; // <-- Tipi sadeleştir. Bırak validator işini yapsın.

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class CreateBoosterDto {
  @IsString()
  title: string;

  @IsEnum(EHiltiLevel)
  required_hilti_level: EHiltiLevel;

  @IsNumber()
  max_level: number;

  @IsArray()
  @ValidateNested({ each: true }) // Dizinin her elemanını doğrula
  @Type(() => UnlockOptionsDto) // <-- Gelen objeyi UnlockOptionsDto'ya dönüştürür
  unlock_options: UnlockOptionsDto[];

  // Dizi olarak tanımla ve her elemanın LevelDataDto olduğunu belirt
  @IsArray()
  @ValidateNested({ each: true }) // Dizinin her elemanını doğrula
  @Type(() => LevelDataDto) // Dizi içindeki elemanları LevelDataDto'ya dönüştür
  level_data: LevelDataDto[]; // Artık bir dizi (Array) bekliyoruz

  @IsString()
  image_url: string;
}
