import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TelegramInitDataMiddleware } from './middleware/telegram-initdata.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Miner, MinerSchema } from 'src/schemas/miner.schema';
import { Hilti, HiltiSchema } from 'src/schemas/hilti.schema';
import { Booster, BoosterSchema } from 'src/schemas/booster.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Miner.name, schema: MinerSchema },
      { name: Hilti.name, schema: HiltiSchema },
      { name: Booster.name, schema: BoosterSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

/* export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TelegramInitDataMiddleware).forRoutes(UserController);
  }
} */
