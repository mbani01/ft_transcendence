import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { gameSocketGateway } from './gameSocket.gateway';

@Module({
  providers: [gameSocketGateway],
  controllers: [GameController]
})
export class GameModule {}
