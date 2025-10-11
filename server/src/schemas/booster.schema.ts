import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BoosterDocument = HydratedDocument<Booster>;

@Schema({ timestamps: true })
export class Booster {
  @Prop({ unique: true, required: true, type: String })
  title: string;

  @Prop({ required: true, type: Number })
  unlock_price: number;

  /* @Prop({required: true, type: Number})
    boost_rate: number; */
}
