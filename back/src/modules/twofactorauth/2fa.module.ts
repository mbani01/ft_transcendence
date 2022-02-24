import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../users/entity/user.entity';
import { TwofactorauthController } from './2fa.controller';
import { TwoFactorAuthService } from './2fa.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { Relation } from '../users/entity/relation.entity';

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([User, Relation]),JwtModule.register({
    secret: String(process.env.JWT_SECRET),
    signOptions: { expiresIn: 60 },
  }),],
  controllers: [TwofactorauthController],
  providers: [TwoFactorAuthService, UsersService, ConfigService, AuthService, JwtStrategy]
})
export class TwofactorauthModule {}
