import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { Relation } from "./entity/relation.entity";
import { Game } from "../game/entities/game.entity";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Module({
  exports: [UsersService], // export User's BL to be available for other modules.
  imports: [TypeOrmModule.forFeature([User, Game, Relation]), CloudinaryModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
