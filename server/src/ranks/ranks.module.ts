import { Module } from '@nestjs/common';
import { RanksController } from './ranks.controller';
import { RanksService } from './ranks.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [RanksController],
  providers: [RanksService],
})
export class RanksModule {}
