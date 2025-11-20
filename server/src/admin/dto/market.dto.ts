import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { EMarketItemType } from 'src/schemas/market.schema';

export class CreateMarketItemDto {
  @IsEnum(EMarketItemType)
  @IsNotEmpty()
  type: EMarketItemType;

  @IsNumber()
  @IsNotEmpty()
  ton_price: number;

  @IsNumber()
  @IsNotEmpty()
  stars_price: number;

  @IsNumber()
  @IsOptional()
  stone_amount?: number;

  @IsNumber()
  @IsOptional()
  stone_bonus?: number;

  @IsNumber()
  @IsOptional()
  total_stones?: number;
}
