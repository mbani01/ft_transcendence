import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModule } from './modules/game/game.module';
import { SocketModule } from './modules/socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GameModule,
    SocketModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // Since we are using PostgreSQL.
      host: 'localhost', // We are devoloping locally.
      port: 5432, // What we set in our docker-compose file.
      username: 'postgres', // ""
      password: 'example', // "pretty straightforward haha"
      database: 'postgres', // db name.
      autoLoadEntities: true, // help load entities automatically.
      synchronize: true, // insures our entities are sync with the database every time we run our app.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
