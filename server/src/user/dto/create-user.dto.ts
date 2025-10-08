import { IsObject, IsString, ValidateNested } from 'class-validator';
import { TelegramDataDto } from './telegram-data.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  _id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => TelegramDataDto)
  telegram_data: TelegramDataDto;
}
