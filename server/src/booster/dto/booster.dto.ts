import { IsNotEmpty, IsString } from 'class-validator';

export class UnlockUserBoosterDto {
  @IsNotEmpty()
  @IsString()
  booster_id: string;
}
