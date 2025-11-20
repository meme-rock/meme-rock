import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ETonPaymentStatus,
  ETonPaymentType,
} from 'src/common/enums/ton-payments.enum';

export type TonPaymentsDocument = HydratedDocument<TonPayments>;

@Schema({ timestamps: true, collection: 'ton_payments' })
export class TonPayments {
  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, enum: ETonPaymentType, required: true })
  payment_type: ETonPaymentType;

  @Prop({ type: Types.ObjectId, required: true })
  item_id: Types.ObjectId;

  @Prop({ type: Number, required: true })
  ton_amount: number;

  @Prop({ type: String, required: true })
  wallet_address: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  is_confirmed: boolean;

  @Prop({ type: Date, default: Date.now, expires: 900 })
  expires_at: Date;
}

export const TonPaymentsSchema = SchemaFactory.createForClass(TonPayments);

TonPaymentsSchema.index({ user_id: 1 });
TonPaymentsSchema.index({ wallet_address: 1 });
TonPaymentsSchema.index({ user_id: 1, wallet_address: 1 });
TonPaymentsSchema.index({ is_confirmed: 1 });
