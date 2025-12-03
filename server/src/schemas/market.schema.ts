import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MarketItemDocument = HydratedDocument<MarketItem>;

export enum EMarketItemType {
  STONE = 'STONE',
  PREMIUM = 'PREMIUM',
}

@Schema({ timestamps: true, collection: 'market_items' })
export class MarketItem {
  @Prop({ type: String, required: true })
  type: EMarketItemType;

  @Prop({ type: Number, required: true })
  ton_price: number;

  @Prop({ type: Number, required: true })
  stars_price: number;

  @Prop({ type: Number })
  stone_amount?: number;

  @Prop({ type: Number })
  stone_bonus?: number;

  @Prop({ type: Number, unique: true })
  total_stones?: number;
}

export const MarketItemSchema = SchemaFactory.createForClass(MarketItem);
