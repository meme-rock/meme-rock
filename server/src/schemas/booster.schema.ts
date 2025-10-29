import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EHiltiLevel } from 'src/common/enums/hiltis.enum';

export type BoosterDocument = HydratedDocument<Booster>;

// Unlock requirements interface
export interface BoosterUnlockRequirements {
  stone?: number;
  dust?: number;
  invite?: number;
}

// Level costs and profits structure
export interface LevelData {
  level: number;
  upgrade_cost: number; // Cost to upgrade to this level (in ROCK)
  profit_per_hour: number; // ROCK earned per hour at this level
}

@Schema({ timestamps: true })
export class Booster {
  @Prop({ unique: true, required: true, type: String })
  title: string;

  @Prop({ required: true, type: String, enum: EHiltiLevel })
  required_hilti_level: EHiltiLevel; // Which Hilti level this booster belongs to

  @Prop({ required: true, type: Number })
  max_level: number; // Maximum level this booster can be upgraded to

  @Prop({ type: Object, default: {} })
  unlock_requirements: BoosterUnlockRequirements; // Requirements to unlock this booster

  @Prop({ type: [Object], default: [] })
  level_data: LevelData[]; // Array of level data (costs and profits per level)

  @Prop({ type: String })
  image_url: string; // Icon/emoji for the booster
}

export const BoosterSchema = SchemaFactory.createForClass(Booster);

/**
 * Example Booster Document Structure:
 *
 * {
 *   _id: "booster_1_1",
 *   title: "Energy Multiplier",
 *   required_hilti_level: "hilti_level_1",
 *   max_level: 10,
 *   unlock_requirements: {
 *     invite: 5,
 *     spend_dust: 100,
 *     spend_stone: 0
 *   },
 *   level_data: [
 *     { level: 1, upgrade_cost: 500, profit_per_hour: 50 },
 *     { level: 2, upgrade_cost: 750, profit_per_hour: 75 },
 *     { level: 3, upgrade_cost: 1000, profit_per_hour: 100 },
 *     // ... up to max_level: 10
 *   ],
 *   description: "Multiplies your energy regeneration rate",
 *   icon: "⚡"
 * }
 */
