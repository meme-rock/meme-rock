import { forwardRef, Module } from '@nestjs/common';
import { StarController } from './star.controller';
import { StarService } from './star.service';
import { BotModule } from 'src/bot/bot.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Booster, BoosterSchema } from 'src/schemas/booster.schema';
import { HelpersModule } from 'src/helpers/helpers.module';
import { MarketItem, MarketItemSchema } from 'src/schemas/market.schema';

@Module({
  imports: [
    forwardRef(() => BotModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Booster.name, schema: BoosterSchema }]),
    MongooseModule.forFeature([
      { name: MarketItem.name, schema: MarketItemSchema },
    ]),
    HelpersModule,
  ],
  controllers: [StarController],
  providers: [StarService],
  exports: [StarService],
})
export class StarModule {}
