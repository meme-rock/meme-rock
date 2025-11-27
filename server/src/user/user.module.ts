import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TelegramInitDataMiddleware } from './middleware/telegram-initdata.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Miner, MinerSchema } from 'src/schemas/miner.schema';
import { Hilti, HiltiSchema } from 'src/schemas/hilti.schema';
import { Booster, BoosterSchema } from 'src/schemas/booster.schema';
import { UserAchivementService } from './user-achivement.service';
import { TaskService } from 'src/task/task.service';
import { BotModule } from 'src/bot/bot.module';
import { MinerService } from 'src/miner/miner.service';
import { HelpersService } from 'src/helpers/helpers.service';
import { MarketItem, MarketItemSchema } from 'src/schemas/market.schema';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Miner.name, schema: MinerSchema },
      { name: Hilti.name, schema: HiltiSchema },
      { name: Booster.name, schema: BoosterSchema },
      { name: MarketItem.name, schema: MarketItemSchema },
    ]),
    BotModule, // BotService'i kullanabilmek için
    TaskModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserAchivementService, MinerService, HelpersService],
})
export class UserModule {}

/* export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TelegramInitDataMiddleware).forRoutes(UserController);
  }
} */
