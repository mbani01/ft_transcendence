import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entity/user.entity';
import { JwtConstants } from '../auth/constants';
import { TwofactorauthController } from './2fa.controller';
import { TwoFactorAuthService } from './2fa.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([User]),JwtModule.register({
    secret: JwtConstants.jwtSecret,
    signOptions: { expiresIn: 60 },
  }),],
  controllers: [TwofactorauthController],
  providers: [TwoFactorAuthService, UsersService, ConfigService, AuthService, JwtStrategy]
})
export class TwofactorauthModule {}
