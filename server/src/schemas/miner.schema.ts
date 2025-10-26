import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EMinerLevel, EMinerRewardType } from 'src/common/enums/miners.enum';

export type MinerDocument = HydratedDocument<Miner>;

// Gereksinimlerin yapısını belirleyen özel bir Interface tanımlayalım (isteğe bağlı)
interface MinerUpgradeRequirements {
  required_achivement: string;
}

@Schema({ timestamps: true, _id: false })
export class Miner {
  @Prop({ type: String, required: true })
  _id: EMinerLevel;

  @Prop({ type: String, required: true })
  reward_type: EMinerRewardType;

  @Prop({ type: Number, required: true })
  profit_per_hour: number;

  @Prop({ type: Number })
  spent_stones_to_upgrade: number;

  @Prop({ type: Object, default: {} }) // MongoDB'de esnek bir Object (veya Map) olarak saklanır
  upgrade_requirements: MinerUpgradeRequirements;
}

export const MinerSchema = SchemaFactory.createForClass(Miner);
