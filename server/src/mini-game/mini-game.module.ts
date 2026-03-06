import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MiniGameCatalog,
  MiniGameCatalogSchema,
  MiniGameConfig,
  MiniGameConfigSchema,
  MiniGameProgress,
  MiniGameProgressSchema,
} from 'src/schemas/mini-games';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MiniGameController } from './mini-game.controller';
import { MiniGameService } from './mini-game.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MiniGameCatalog.name, schema: MiniGameCatalogSchema },
      { name: MiniGameConfig.name, schema: MiniGameConfigSchema },
      { name: MiniGameProgress.name, schema: MiniGameProgressSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MiniGameController],
  providers: [MiniGameService],
  exports: [],
})
export class MiniGameModule {}
