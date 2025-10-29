import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';

export class LevelDataDto {
  @IsNumber()
  level: number;

  @IsNumber()
  upgrade_cost: number;

  @IsNumber()
  profit_per_hour: number;
}
export class UnlockRequirementsDto {
  @IsNumber()
  stone?: number;

  @IsNumber()
  dust?: number;

  @IsNumber()
  invite?: number;
}

export class CreateBoosterDto {
  @IsString()
  title: string;

  @IsEnum(EHiltiLevel)
  required_hilti_level: EHiltiLevel;

  @IsNumber()
  max_level: number;

  @IsObject()
  unlock_requirements: UnlockRequirementsDto;

  // Dizi olarak tanımla ve her elemanın LevelDataDto olduğunu belirt
  @IsArray()
  @ValidateNested({ each: true }) // Dizinin her elemanını doğrula
  @Type(() => LevelDataDto) // Dizi içindeki elemanları LevelDataDto'ya dönüştür
  level_data: LevelDataDto[]; // Artık bir dizi (Array) bekliyoruz

  @IsString()
  image_url: string;
}
