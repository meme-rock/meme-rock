import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { BotModule } from 'src/bot/bot.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import {
  TonPayments,
  TonPaymentsSchema,
} from 'src/schemas/ton-payments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TonPayments.name, schema: TonPaymentsSchema },
    ]),
    BotModule,
  ],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
