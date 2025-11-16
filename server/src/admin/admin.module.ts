import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Miner, MinerSchema } from 'src/schemas/miner.schema';
import { AdminController, AdminRanksController } from './admin.controller';
import { AdminService } from './admin.service';
import { Hilti, HiltiSchema } from 'src/schemas/hilti.schema';
import { Booster, BoosterSchema } from 'src/schemas/booster.schema';
import { AdminRanksService } from './admin.ranks.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { BotService } from 'src/bot/bot.service';
import { HelpersService } from 'src/helpers/helpers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Miner.name, schema: MinerSchema },
      { name: Hilti.name, schema: HiltiSchema },
      { name: Booster.name, schema: BoosterSchema },
    ]),
  ],
  controllers: [AdminController, AdminRanksController],
  providers: [AdminService, AdminRanksService, BotService, HelpersService],
})
export class AdminModule {}
