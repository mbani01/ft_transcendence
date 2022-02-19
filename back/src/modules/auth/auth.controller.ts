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
      page: 'https://api.intra.42.fr/oauth/authorize?client_id=802dd62932bab69d1e0168a42ed0567a6b83267c134fb2f62d583c14b2a4ce97&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Flogin&response_type=code',
    };
  }

  @Post('/access_token')
  async authenticate(@Query() paginationQuery: any, @Res() response: Response) {
    const { code, twoFactorAuth } = paginationQuery;
    console.log(code);
    let userExist;
    if (!this.mappedAccessCodeWithUser.has(code)) {
      const newUser: CreateUserDto = await this._authService.getUserData(code);
      if (!newUser) throw new BadRequestException('Invalid User or token');
      userExist = await this._usersService.findByUserName(newUser.username);
      if (!userExist) {
        userExist = await this._usersService.create(newUser);
        return await this._authService.sendJwtAccessToken(response, userExist, false);
      }

      if (userExist && userExist.is2FAEnabled && !this.mappedAccessCodeWithUser.has(code)) {
        this.mappedAccessCodeWithUser.set(code, userExist);
        console.log(this.mappedAccessCodeWithUser);
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
    console.log('Yes code is valid');
    await this._authService.sendJwtAccessToken(response, userExist, true);
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
    console.log('WTF');
    return req.user;
  }
}
