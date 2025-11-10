import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserBoosterController, UserController } from './user.controller';
import { UserService } from './user.service';
import { TelegramInitDataMiddleware } from './middleware/telegram-initdata.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Miner, MinerSchema } from 'src/schemas/miner.schema';
import { Hilti, HiltiSchema } from 'src/schemas/hilti.schema';
import { Booster, BoosterSchema } from 'src/schemas/booster.schema';
import { UserBoosterService } from './user-booster.service';
import { UserAchivementService } from './user-achivement.service';
import { UserHiltiService } from './user-hilti.service';

import { BotModule } from 'src/bot/bot.module';
import { MinerService } from 'src/miner/miner.service';
import { HelpersService } from 'src/helpers/helpers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Miner.name, schema: MinerSchema },
      { name: Hilti.name, schema: HiltiSchema },
      { name: Booster.name, schema: BoosterSchema },
    ]),
    BotModule, // BotService'i kullanabilmek için
  ],
  controllers: [UserController, UserBoosterController],
  providers: [
    UserService,
    UserBoosterService,
    UserAchivementService,
    UserHiltiService,
    MinerService,
    HelpersService,
  ],
})
export class UserModule {}

/* export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TelegramInitDataMiddleware).forRoutes(UserController);
  }
} */
