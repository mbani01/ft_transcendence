import {
  Controller,
  Get,
  Req,
  Post,
  Query,
  UseGuards,
  Res,
  BadRequestException,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { TwoFactorAuthService } from '../twofactorauth/2fa.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CreateAuthPaginationDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _usersService: UsersService,
    private readonly _twoFAService: TwoFactorAuthService,
  ) { }

  private mappedAccessCodeWithUser = new Map();

  @UseGuards(JwtAuthGuard)
  @Get('isAuthorized')
  isAuthenticated(@Req() req) {
    return req.user;
  }

  @Get('/oauth_page')
  getOauthPage() {
    return {
      page: this._authService._configService.get('API_LINK')
    };
  }

  @Post('/access_token')
  async authenticate(@Query() paginationQuery: CreateAuthPaginationDto, @Res() response: Response) {
    const { code, twoFactorAuth } = paginationQuery;
    let userExist;
    if (!this.mappedAccessCodeWithUser.has(code)) {
      const newUser: CreateUserDto = await this._authService.getUserData(code);
      if (!newUser) throw new BadRequestException('Invalid User or token');
      userExist = await this._usersService.findByCriteria({ email: newUser.email });
      if (!userExist) {
        userExist = await this._usersService.create(newUser);
        return await this._authService.sendJwtAccessToken(response, userExist, false, true);
      }

      if (userExist && userExist.is2FAEnabled && !this.mappedAccessCodeWithUser.has(code)) {
        this.mappedAccessCodeWithUser.set(code, userExist);

        throw new UnauthorizedException({ "is2FA": true });
      }
    }


    if (this.mappedAccessCodeWithUser.has(code)) {
      userExist = this.mappedAccessCodeWithUser.get(code);
      const isValid2FACode = this._twoFAService.is2FactorAuthCodeValid(
        twoFactorAuth,
        userExist.twoFASecret,
      );
      if (!isValid2FACode) throw new UnauthorizedException('Invalid 2fa code!');
      this.mappedAccessCodeWithUser.delete(code);
    }
    await this._authService.sendJwtAccessToken(response, userExist, true, false);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/logout')
  logOut(@Res() res) {
    res.clearCookie('access_token');
    res.end();
  }


  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
