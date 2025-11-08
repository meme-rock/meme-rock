import { Module } from '@nestjs/common';
import { MinerController } from './miner.controller';
import { MinerService } from './miner.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Miner } from 'src/schemas/miner.schema';
import { MinerSchema } from 'src/schemas/miner.schema';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Miner.name, schema: MinerSchema },
    ]),
  ],
  controllers: [MinerController],
  providers: [MinerService],
  exports: [],
})
export class MinerModule {}
