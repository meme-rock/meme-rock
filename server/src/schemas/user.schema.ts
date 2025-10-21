import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false, timestamps: false })
class AdData {
  @Prop({ type: Number, default: 0 })
  ads_watched: number;

  @Prop({ type: Date })
  last_ad_watched: Date;

  @Prop({ type: Number, default: 0 })
  ads_watched_today: number;
}
// Airdrop için ayrı bir alt şema
@Schema({ _id: false, timestamps: false })
class AirdropData {
  @Prop({ type: Number, default: 0 })
  rock_coins: number;

  @Prop({ type: String, default: null })
  wallet_address: string;

  @Prop({ type: Number, default: 0 })
  profit_per_hour: number;
}

// Telegram InitData için ayrı bir alt şema
@Schema({ _id: false, timestamps: false })
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
@Schema({ _id: false, timestamps: false })
class MinerData {
  @Prop({ type: String, ref: 'Miner' })
  miner: string;

  @Prop({ type: Date, default: Date.now() })
  last_mine: Date;
}

//? Hilti için ayrı bir alt şema oluşturuyoruz. GameData'ya bağlıyoruz.
@Schema({ _id: false, timestamps: false })
class HiltiData {
  @Prop({ type: String, ref: 'Hilti' })
  hilti: string;
}

//? Booster için ayrı bir alt şema oluşturuyoruz. User'ın unlock ettiği ve level bilgisini tutar.
@Schema({ _id: false, timestamps: false })
class BoosterData {
  @Prop({ type: String, ref: 'Booster', required: true })
  booster: string; // e.g., "booster_1_1"

  @Prop({ type: Number, default: 0 })
  current_level: number; // Current level of this booster (0 = not unlocked)
}

//? Balance için ayrı bir alt şema oluşturuyoruz.
@Schema({ _id: false })
class BalanceData {
  @Prop({ type: Number, default: 0 })
  stone: number;

  @Prop({ type: Number, default: 0 })
  dust: number;
}

@Schema({ _id: false })
class PaymentData {
  @Prop({ type: Number, default: 0 })
  total_star_payment: number;

  @Prop({ type: Number, default: 0 })
  total_ton_payment: number;

  @Prop({ type: Number, default: 0 })
  last_payment_date: Date;
}

@Schema({ timestamps: true, _id: false })
export class User {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: TelegramData })
  telegram_data: TelegramData;

  @Prop({ type: BalanceData })
  balance_data: BalanceData;

  @Prop({ type: PaymentData })
  payment_data: PaymentData;

  @Prop({ type: AirdropData })
  airdrop_data: AirdropData;

  @Prop({ type: AdData })
  ad_data: AdData;

  @Prop({ type: MinerData })
  miner_data: MinerData;

  @Prop({ type: HiltiData })
  hilti_data: HiltiData;

  @Prop({ type: [BoosterData], default: [] })
  boosters: BoosterData[]; // Array of user's boosters with their levels

  @Prop({ type: Boolean, default: false })
  is_premium: boolean;

  @Prop({ type: String, default: null })
  invited_by: string;

  @Prop({ type: Number, default: 0 })
  invite_count: number;

  @Prop({ type: Date, default: Date.now() })
  created_at: Date;

  @Prop({ type: Date, default: Date.now() })
  last_online: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// --- İNDEX TANIMLARI ---

// 1. Multikey İndeks: Booster Varlığı/Eşleşmesi Kontrolünü Hızlandırır
// Unique constraint removed to prevent duplicate key errors with null values
UserSchema.index(
  { _id: 1, 'boosters.booster': 1 },
  { name: 'userBoosterAccess' },
);

// 2. Saatlik Kâr Sıralaması İndeksi
UserSchema.index(
  { 'airdrop_data.profit_per_hour': -1 },
  { name: 'profitPerHourSort' },
);

// 3. KRİTİK LİDERLİK İNDEKSİ: Canlı rank sorgularını hızlandırır ve tie-breaker sağlar.
// Rock Coin'i büyükten küçüğe sırala (-1) ve eşitlik durumunda _id'ye göre sırala (1).
UserSchema.index(
  { 'airdrop_data.rock_coins': -1, _id: 1 },
  { name: 'rockCoinRankSort' },
);
