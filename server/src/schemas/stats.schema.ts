import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StatsDocument = HydratedDocument<Stats>;

@Schema({ timestamps: true, _id: false })
export class Stats {
  @Prop({ type: String, required: true, unique: true })
  _id: string;

  @Prop({ type: Number, required: true })
  total_mined: number;

  @Prop({ type: Number, required: true })
  total_participants: number;
}

export const StatsSchema = SchemaFactory.createForClass(Stats);
