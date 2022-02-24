import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersService } from "src/modules/users/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/modules/users/entity/user.entity";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { UsersModule } from "src/modules/users/users.module";
import { JwtStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { TwoFactorAuthService } from "src/modules/twofactorauth/2fa.service";
import { Relation } from "../users/entity/relation.entity";
import { ConfigModule } from "@nestjs/config";
@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Relation]),
    JwtModule.register({
      secret: "secret",
      // signOptions: { expiresIn: 60 },
    }),
  ],
  exports: [AuthService],
  providers: [AuthService, UsersService, JwtStrategy, TwoFactorAuthService, ConfigModule],
  controllers: [AuthController],
})
export class AuthModule {}
