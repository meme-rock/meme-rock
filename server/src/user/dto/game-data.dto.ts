import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class GameDataDto {
  @IsNumber()
  @IsOptional()
  stones: number;

  @IsNumber()
  @IsOptional()
  level: number;

  @IsNumber()
  @IsOptional()
  profit_per_hour: number;

  @IsBoolean()
  @IsOptional()
  is_premium: boolean;

  @IsBoolean()
  @IsOptional()
  auto_collector: boolean;
}
