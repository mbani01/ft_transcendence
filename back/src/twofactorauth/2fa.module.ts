import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './2fa.service';
import { TwofactorauthController } from './2fa.controller';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtConstants } from 'src/auth/constants';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([User]),JwtModule.register({
    secret: JwtConstants.jwtSecret,
    signOptions: { expiresIn: 60 },
  }),],
  controllers: [TwofactorauthController],
  providers: [TwoFactorAuthService, UsersService, ConfigService, AuthService, JwtStrategy]
})
export class TwofactorauthModule {}
