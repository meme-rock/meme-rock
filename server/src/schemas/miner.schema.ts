import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EMinerLevel } from 'src/common/enums/miners.enum';

export type MinerDocument = HydratedDocument<Miner>;

// Gereksinimlerin yapısını belirleyen özel bir Interface tanımlayalım (isteğe bağlı)
interface MinerUpgradeRequirements {
  // Gelecekte eklenecek her türlü yeni gereksinim (örn. 'itemA_count', 'mission_completed' vb.)
  [key: string]: any;
}

@Schema({ timestamps: true, _id: false })
export class Miner {
  @Prop({ type: String, required: true })
  _id: EMinerLevel;

  @Prop({ type: Number, required: true })
  stones_income: number;

  @Prop({ type: Number, required: true })
  spent_stones_to_upgrade: number;

  @Prop({ type: Object, default: {} }) // MongoDB'de esnek bir Object (veya Map) olarak saklanır
  upgrade_requirements: MinerUpgradeRequirements;
}

export const MinerSchema = SchemaFactory.createForClass(Miner);
