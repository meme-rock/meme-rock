import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';

export type HiltiDocument = HydratedDocument<Hilti>;

@Schema({ timestamps: true, _id: false })
export class Hilti {
  @Prop({ type: String, required: true })
  _id: EHiltiLevel;

  @Prop({ type: Number, required: true })
  profit_per_hour: number;

  // YENİ ALAN: Bir sonraki seviyeye geçmek için gerekenler.
  // Bu alanda, her Hilti seviyesi için farklı gereksinimler tanımlanabilir.
  @Prop({ type: Number }) // MongoDB'de esnek bir Object (veya Map) olarak saklanır
  profit_per_hour_to_upgrade: number;
  @Prop({ type: Number })
  stone_price_to_upgrade: number;
}

export const HiltiSchema = SchemaFactory.createForClass(Hilti);
