import { Module } from '@nestjs/common';
import { TonController } from './ton.controller';
import { TonService } from './ton.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TonPayments,
  TonPaymentsSchema,
} from 'src/schemas/ton-payments.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MarketItem, MarketItemSchema } from 'src/schemas/market.schema';
import { Booster, BoosterSchema } from 'src/schemas/booster.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TonPayments.name, schema: TonPaymentsSchema },
      { name: User.name, schema: UserSchema },
      { name: MarketItem.name, schema: MarketItemSchema },
      { name: Booster.name, schema: BoosterSchema },
    ]),
  ],
  controllers: [TonController],
  providers: [TonService],
})
export class TonModule {}
