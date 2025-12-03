import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class PurchaseBoosterDto {
  @IsNotEmpty()
  @IsMongoId()
  booster_id: string;
}

export class PurchaseStonesDto {
  @IsNotEmpty()
  @IsNumber()
  stars_price: number;
}
