import { Module } from '@nestjs/common';
import { HiltiController } from './hilti.controller';
import { HiltiService } from './hilti.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Hilti, HiltiDocument, HiltiSchema } from 'src/schemas/hilti.schema';
import { User, UserDocument, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Hilti.name, schema: HiltiSchema },
    ]),
  ],
  controllers: [HiltiController],
  providers: [HiltiService],
})
export class HiltiModule {}
