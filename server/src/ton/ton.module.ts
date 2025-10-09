import { Module } from '@nestjs/common';
import { TonController } from './ton.controller';
import { TonService } from './ton.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TonPayments,
  TonPaymentsSchema,
} from 'src/schemas/ton-payments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TonPayments.name, schema: TonPaymentsSchema },
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
