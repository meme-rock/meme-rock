import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class TelegramDataDto {
  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  language_code: string;

  @IsString()
  @IsOptional()
  first_name: string;

  @IsString()
  @IsOptional()
  last_name: string;

  @IsBoolean()
  @IsOptional()
  is_telegram_premium: boolean;

  @IsString()
  @IsOptional()
  photo_url: string;

  @IsBoolean()
  @IsOptional()
  allows_write_to_pm: boolean;
}
