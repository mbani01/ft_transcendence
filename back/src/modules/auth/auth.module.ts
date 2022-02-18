import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersService } from "src/modules/users/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/modules/users/entity/user.entity";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { JwtConstants } from "./constants";
import { UsersModule } from "src/modules/users/users.module";
import { JwtStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { TwoFactorAuthService } from "src/modules/twofactorauth/2fa.service";
@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: JwtConstants.jwtSecret,
      // signOptions: { expiresIn: 60 },
    }),
  ],
  exports: [AuthService],
  providers: [AuthService, UsersService, JwtStrategy, TwoFactorAuthService],
  controllers: [AuthController],
})
export class AuthModule {}