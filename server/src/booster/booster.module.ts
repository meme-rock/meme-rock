import { Module, forwardRef } from '@nestjs/common';
import { BoosterController } from './booster.controller';
import { BoosterService } from './booster.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Booster, BoosterSchema } from 'src/schemas/booster.schema';
import { Miner, MinerSchema } from 'src/schemas/miner.schema';
import { Hilti, HiltiSchema } from 'src/schemas/hilti.schema';
import { BotModule } from 'src/bot/bot.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Miner.name, schema: MinerSchema },
      { name: Hilti.name, schema: HiltiSchema },
      { name: Booster.name, schema: BoosterSchema },
    ]),
    forwardRef(() => BotModule),
  ],
  controllers: [BoosterController],
  providers: [BoosterService],
  exports: [BoosterService],
})
export class BoosterModule {}
