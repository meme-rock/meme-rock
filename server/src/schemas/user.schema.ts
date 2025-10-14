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
//? Miner için ayrı bir alt şema oluşturuyoruz. GameData'ya bağlıyoruz.
@Schema({ _id: false })
class MinerData {
  @Prop({ type: String, ref: 'Miner' })
  miner: string;

  @Prop({ type: Date, default: Date.now() })
  last_mine: Date;
}

//? Hilti için ayrı bir alt şema oluşturuyoruz. GameData'ya bağlıyoruz.
@Schema({ _id: false })
class HiltiData {
  @Prop({ type: String, ref: 'Hilti' })
  hilti: string;

  @Prop({ type: Number, default: 0 })
  current_energy: number;

  @Prop({ type: Date, default: Date.now() })
  last_energy_refill: Date;
}

//? Booster için ayrı bir alt şema oluşturuyoruz. User'ın unlock ettiği ve level bilgisini tutar.
@Schema({ _id: false })
class UserBooster {
  @Prop({ type: String, ref: 'Booster', required: true })
  booster_id: string; // e.g., "booster_1_1"

  @Prop({ type: Number, default: 0 })
  current_level: number; // Current level of this booster (0 = not unlocked)

  @Prop({ type: Date })
  unlocked_at?: Date;

  @Prop({ type: Date })
  last_upgraded_at?: Date;
}

//? GameData için ayrı bir alt şema oluşturuyoruz.
@Schema({ _id: false })
class GameData {
  @Prop({ type: Number, default: 0 })
  stones: number;

  @Prop({ type: Number, default: 0 })
  dust: number;

  @Prop({ type: Number, default: 0 })
  rocks: number;

  // Spending tracking for unlock requirements
  @Prop({ type: Number, default: 0 })
  spent_dust: number;

  @Prop({ type: Number, default: 0 })
  spent_stone: number;

  @Prop({ type: Number, default: 0 })
  profit_per_hour: number;

  @Prop({ type: Boolean, default: false })
  is_premium: boolean;

  @Prop({ type: Boolean, default: false })
  auto_collector: boolean;

  @Prop({ type: MinerData })
  miner_data: MinerData;

  @Prop({ type: HiltiData })
  hilti_data: HiltiData;

  @Prop({ type: [UserBooster], default: [] })
  boosters: UserBooster[]; // Array of user's boosters with their levels
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
