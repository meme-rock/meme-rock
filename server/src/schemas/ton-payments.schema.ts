import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ETonPaymentStatus } from 'src/common/enums/ton-payments.enum';

export type TonPaymentsDocument = HydratedDocument<TonPayments>;

@Schema({ timestamps: true })
export class TonPayments {
  @Prop({ type: String, required: true })
  stone_amount: number;

  @Prop({ type: Number, required: true })
  ton_amount: number;

  @Prop({ type: String, required: true })
  wallet_address: string;

  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, default: ETonPaymentStatus.PENDING })
  status: ETonPaymentStatus;

  @Prop({ type: Date, default: Date.now, expires: 900 })
  expires_at: Date;
}

export const TonPaymentsSchema = SchemaFactory.createForClass(TonPayments);

TonPaymentsSchema.index({ user_id: 1 });
TonPaymentsSchema.index({ wallet_address: 1 });
TonPaymentsSchema.index({ user_id: 1, wallet_address: 1 });
