import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';

export type HiltiDocument = HydratedDocument<Hilti>;

// Gereksinimlerin yapısını belirleyen özel bir Interface tanımlayalım (isteğe bağlı)
interface HiltiUpgradeRequirements {
  // Gelecekte eklenecek her türlü yeni gereksinim (örn. 'itemA_count', 'mission_completed' vb.)
  [key: string]: any;
}

@Schema({ timestamps: true, _id: false })
export class Hilti {
  @Prop({ type: String, required: true })
  _id: EHiltiLevel;

  @Prop({ type: Number, required: true })
  rock_income: number;

  // YENİ ALAN: Bir sonraki seviyeye geçmek için gerekenler.
  // Bu alanda, her Hilti seviyesi için farklı gereksinimler tanımlanabilir.
  @Prop({ type: Object, default: {} }) // MongoDB'de esnek bir Object (veya Map) olarak saklanır
  upgrade_requirements: HiltiUpgradeRequirements;
}

export const HiltiSchema = SchemaFactory.createForClass(Hilti);
