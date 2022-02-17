import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModule } from './modules/game/game.module';
import { SocketModule } from './modules/socket/socket.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TwofactorauthModule } from './twofactorauth/2fa.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join("/Users/mosan/Desktop/Repositories/mbnai-trans/front/dist/ft_transcendence"),
    // }),
    ConfigModule.forRoot({ isGlobal: true }),
    GameModule,
    SocketModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // Since we are using PostgreSQL.
      host: 'localhost', // We are devoloping locally.
      port: 5432, // What we set in our docker-compose file.
      username: 'leet_admin', // ""
      password: 'leetask', // "pretty straightforward haha"
      database: 'ft_tran', // db name.
      autoLoadEntities: true, // help load entities automatically.
      synchronize: true, // insures our entities are sync with the database every time we run our app.
    }),
    UsersModule,
    AuthModule,
    TwofactorauthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
