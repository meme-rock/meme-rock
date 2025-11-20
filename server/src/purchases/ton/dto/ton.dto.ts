import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class PurchaseBoosterDto {
  @IsNotEmpty()
  @IsMongoId()
  booster_id: string;

  @IsNotEmpty()
  @IsString()
  wallet_address: string;
}

export class PurchaseStonesDto {
  @IsNotEmpty()
  @IsNumber()
  ton_price: number;

  @IsNotEmpty()
  @IsString()
  wallet_address: string;
}

export class PurchasePremiumDto {
  @IsNotEmpty()
  @IsString()
  wallet_address: string;
}
