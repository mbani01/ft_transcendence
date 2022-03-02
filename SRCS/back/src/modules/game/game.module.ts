import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { GameController } from './game.controller';
import { gameSocketGateway } from './gameSocket.gateway';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Relation } from "../users/entity/relation.entity";
import { User } from "src/modules/users/entity/user.entity";
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [UsersModule,
    TypeOrmModule.forFeature([User, Relation]), CloudinaryModule],
  providers: [gameSocketGateway, UsersService],
  controllers: [GameController]
})
export class GameModule {}
