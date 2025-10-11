import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EMinerLevel } from 'src/common/enums/miners.enum';

export type MinerDocument = HydratedDocument<Miner>;

@Schema({ timestamps: true, _id: false })
export class Miner {
  @Prop({ type: String, required: true })
  _id: EMinerLevel;

  @Prop({ type: Number, required: true })
  stones_income: number;

  @Prop({ type: Number, required: true })
  spent_stones_to_upgrade: number;
}

export const MinerSchema = SchemaFactory.createForClass(Miner);
