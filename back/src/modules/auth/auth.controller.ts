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
import fs from 'fs';
import * as request from 'request';
import {join} from "path";

const download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

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
        download(newUser.avatar, join(__dirname, `../../../src/assets/avatars/${userExist.id2}`), ()=>{console.log('done')});
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
