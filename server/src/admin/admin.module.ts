import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Miner, MinerSchema } from 'src/schemas/miner.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Miner.name, schema: MinerSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
