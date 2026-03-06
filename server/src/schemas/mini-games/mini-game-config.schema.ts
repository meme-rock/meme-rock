import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MiniGameConfigDocument = HydratedDocument<MiniGameConfig>;

@Schema({ _id: false })
export class UpgradeDef {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '' })
  icon: string;

  @Prop({ type: Number, required: true })
  base_cost: number;

  @Prop({ type: Number, required: true })
  cost_multiplier: number;
}

export const UpgradeDefSchema = SchemaFactory.createForClass(UpgradeDef);

@Schema({ timestamps: true, _id: false })
export class MiniGameConfig {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: Number, required: true })
  daily_plays: number;

  @Prop({ type: Number, required: true })
  max_ads_per_day: number;

  @Prop({ type: Number, required: true })
  plays_per_ad: number;

  @Prop({ type: Number, required: true })
  max_upgrade_level: number;

  @Prop({ type: String, required: true })
  upgrade_currency_field: string;

  @Prop({ type: [UpgradeDefSchema], default: [] })
  upgrades: UpgradeDef[];

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  game_constants: Record<string, any>;
}

export const MiniGameConfigSchema =
  SchemaFactory.createForClass(MiniGameConfig);
