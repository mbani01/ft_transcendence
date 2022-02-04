import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModule } from './modules/game/game.module';
import { SocketModule } from './modules/socket/socket.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), GameModule, SocketModule, TypeOrmModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
