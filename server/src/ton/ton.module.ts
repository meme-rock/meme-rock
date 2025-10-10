import { Module } from '@nestjs/common';
import { TonController } from './ton.controller';
import { TonService } from './ton.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TonPayments,
  TonPaymentsSchema,
} from 'src/schemas/ton-payments.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TonPayments.name, schema: TonPaymentsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TonController],
  providers: [TonService],
})
export class TonModule {}

/* export class TonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TelegramInitDataMiddleware).forRoutes(TonController);
  }
} */
