import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EMinerLevel, EMinerRewardType } from 'src/common/enums/miners.enum';

export type MinerDocument = HydratedDocument<Miner>;

@Schema({ timestamps: true, _id: false })
export class Miner {
  @Prop({ type: String, required: true, unique: true })
  _id: EMinerLevel;

  @Prop({ type: String, required: true })
  reward_type: EMinerRewardType;

  @Prop({ type: Number, required: true })
  profit_per_hour: number;

  @Prop({ type: Number })
  stone_price_to_upgrade: number;
}

export const MinerSchema = SchemaFactory.createForClass(Miner);
