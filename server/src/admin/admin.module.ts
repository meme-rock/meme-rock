import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Miner, MinerSchema } from 'src/schemas/miner.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Hilti, HiltiSchema } from 'src/schemas/hilti.schema';
import { Booster, BoosterSchema } from 'src/schemas/booster.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Miner.name, schema: MinerSchema },
      { name: Hilti.name, schema: HiltiSchema },
      { name: Booster.name, schema: BoosterSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
