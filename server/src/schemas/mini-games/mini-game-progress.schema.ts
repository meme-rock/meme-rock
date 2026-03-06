import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MiniGameProgressDocument = HydratedDocument<MiniGameProgress>;

@Schema({ timestamps: true, _id: false, collection: 'minigamestates' })
export class MiniGameProgress {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, required: true })
  game_type: string;

  @Prop({ type: Number, default: 0 })
  daily_plays_left: number;

  @Prop({ type: Number, default: 0 })
  ads_watched_today: number;

  @Prop({ type: Date, default: () => new Date() })
  last_reset_date: Date;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  active_session: Record<string, any> | null;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  game_data: Record<string, any>;
}

export const MiniGameProgressSchema =
  SchemaFactory.createForClass(MiniGameProgress);

MiniGameProgressSchema.index(
  { user_id: 1, game_type: 1 },
  { unique: true, name: 'userGameType' },
);
