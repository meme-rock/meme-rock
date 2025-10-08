import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// Telegram InitData için ayrı bir alt şema oluşturabilirsiniz.
@Schema({ _id: false })
class TelegramData {
  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  language_code: string;

  @Prop({ type: String })
  first_name: string;

  @Prop({ type: String })
  last_name: string;

  @Prop({ type: Boolean })
  is_telegram_premium: boolean;

  @Prop({ type: String })
  photo_url: string;

  @Prop({ type: Boolean })
  allows_write_to_pm: boolean;
}

@Schema({ _id: false })
class GameData {
  @Prop({ type: Number, default: 0 })
  stones: number;

  @Prop({ type: Number, default: 0 })
  level: number;

  @Prop({ type: Number, default: 0 })
  profit_per_hour: number;

  @Prop({ type: Boolean, default: false })
  is_premium: boolean;

  @Prop({ type: Boolean, default: false })
  auto_collector: boolean;
}

@Schema({ timestamps: true, _id: false })
export class User {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: TelegramData })
  telegram_data: TelegramData;

  @Prop({ type: GameData })
  game_data: GameData;

  @Prop({ type: String, default: null })
  invited_by: string;

  @Prop({ type: Number, default: 0 })
  invite_count: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
