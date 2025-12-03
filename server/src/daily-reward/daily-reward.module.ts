import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { DailyRewardService } from './daily-reward.service';
import { DailyRewardController } from './daily-reward.controller';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [DailyRewardController],
  providers: [DailyRewardService],
})
export class DailyRewardModule {}
