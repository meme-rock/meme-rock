import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MiniGameCatalogDocument = HydratedDocument<MiniGameCatalog>;

@Schema({ timestamps: true, _id: false })
export class MiniGameCatalog {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  icon: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: Boolean, default: false })
  is_locked: boolean;

  @Prop({ type: Number, default: 0 })
  sort_order: number;

  @Prop({ type: String, default: '' })
  description: string;
}

export const MiniGameCatalogSchema =
  SchemaFactory.createForClass(MiniGameCatalog);
