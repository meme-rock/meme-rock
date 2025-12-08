import { forwardRef, Module } from '@nestjs/common';
import { TonController, TonScheduleController } from './ton.controller';
import { TonService } from './ton.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TonPayments,
  TonPaymentsSchema,
} from 'src/schemas/ton-payments.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MarketItem, MarketItemSchema } from 'src/schemas/market.schema';
import { Booster, BoosterSchema } from 'src/schemas/booster.schema';
import { TonScheduleService } from './ton-schedule.service';
import { BotModule } from 'src/bot/bot.module';
import { HelpersModule } from 'src/helpers/helpers.module';

@Module({
  imports: [
    forwardRef(() => BotModule),
    MongooseModule.forFeature([
      { name: TonPayments.name, schema: TonPaymentsSchema },
      { name: User.name, schema: UserSchema },
      { name: MarketItem.name, schema: MarketItemSchema },
      { name: Booster.name, schema: BoosterSchema },
    ]),
    HelpersModule,
  ],
  controllers: [TonScheduleController, TonController],
  providers: [TonService, TonScheduleService],
})
export class TonModule {}
