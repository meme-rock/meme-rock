import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { BotModule } from 'src/bot/bot.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import {
  TonPayments,
  TonPaymentsSchema,
} from 'src/schemas/ton-payments.schema';
import { HelpersModule } from 'src/helpers/helpers.module';
import { MarketItem, MarketItemSchema } from 'src/schemas/market.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TonPayments.name, schema: TonPaymentsSchema },
      { name: MarketItem.name, schema: MarketItemSchema },
    ]),
    forwardRef(() => BotModule),
    HelpersModule,
  ],
  controllers: [MarketController],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
