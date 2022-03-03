import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModule } from './modules/game/game.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TwofactorauthModule } from './modules/twofactorauth/2fa.module';
import { ChatModule } from './modules/chat/chat.module';
import appConfig from './app.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path/posix';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join("/srcs/front/dist/ft_transcendence"),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig]
      // validationSchema: ({
      //   DATABASE_HOST: Joi.required(),
      //   DATABASE_PORT: Joi.number().default(3000),
      //   DATABASE_USER: Joi.string().required(),
      //   DATABASE_PASSWORD: Joi.string().min(5).max(18).required(),
      //   DATABASE_NAME: Joi.string().required(),
      //   UID: Joi.string().length(64).required(),
      //   SECRET: Joi.string().length(64).required(),
      //   REDIRECT_URI: Joi.string().required(),
      //   API_LINK: Joi.string().required(),
      // }),
    }),
    GameModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // Since we are using PostgreSQL.
      host: process.env.DB_HOST, // We are devoloping locally.
      port: +process.env.DB_PORT, // What we set in our docker-compose file.
      username: process.env.DB_USERNAME, // ""
      password: process.env.DB_PASSWORD, // "pretty straightforward haha"
      database: process.env.DB_NAME, // db name.
      autoLoadEntities: true, // help load entities automatically.
      synchronize: true, // insures our entities are sync with the database every time we run our app.
    }),
    UsersModule,
    AuthModule,
    TwofactorauthModule,
    ChatModule,
    CloudinaryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }