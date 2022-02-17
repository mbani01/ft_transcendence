import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { Game } from "./entity/game.entity";
import { Relation } from "./entity/relation.entity";

@Module({
  exports: [UsersService], // export User's BL to be available for other modules.
  imports: [TypeOrmModule.forFeature([User, Game, Relation])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
