import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';

export type BoosterDocument = HydratedDocument<Booster>;

@Schema({ timestamps: true })
export class Booster {
  @Prop({ unique: true, required: true, type: String })
  title: string;

  @Prop({ required: true, type: Number })
  unlock_price: number;

  @Prop({ required: true, type: String, enum: EHiltiLevel })
  required_hilti_level: EHiltiLevel;

  @Prop({ required: true, type: Number })
  boost_rate: number;

  @Prop({ type: String })
  description?: string;
}
