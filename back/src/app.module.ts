import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './modules/game/game.module';

@Module({
  imports: [DatabaseModule, ConfigModule.forRoot({isGlobal: true}), GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
