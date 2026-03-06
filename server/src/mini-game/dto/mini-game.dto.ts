import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class EndSessionDto {
  @IsNumber()
  @Min(0)
  rocksSmashed: number;
}

export class UpgradeDto {
  @IsString()
  @IsNotEmpty()
  upgradeId: string;
}
