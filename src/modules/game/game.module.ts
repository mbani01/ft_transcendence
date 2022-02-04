import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';

@Module({
  providers: [GameService],
  controllers: [GameController]
})
export class GameModule {}
