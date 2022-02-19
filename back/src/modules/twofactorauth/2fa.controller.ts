import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { TwoFactorAuthService } from './2fa.service';
import { TwoFACodeDto } from './dto/two-fadto.dto';

@Controller('twofa')
export class TwofactorauthController {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _twoFAService: TwoFactorAuthService,
    private readonly _authService: AuthService,
  ) { }

  @Get()
  test() {
    return 'this action returns test';
  }

  @UseGuards(JwtAuthGuard)
  @Get('/register')
  async register(@Req() req, @Res() res: Response) {
    const { username } = req.user;
    console.log(req.user);
    console.log(username);
    const user = await this._usersService.findByUserName(username);
    if (!user) throw new UnauthorizedException();
    const { otpauthUrl } = await this._twoFAService.generate2FASecret(user);
    await QRCode.toDataURL(otpauthUrl).then((result) => res.send(JSON.stringify({ qrcode: result })));
  }

  @UseGuards(JwtAuthGuard)
  @Post('turn_on/:id')
  async trunOn2FA(@Param('id') id: number, @Body() { code }: TwoFACodeDto) {
    const user = await this._usersService.findById(id);
    const isValidCode = this._twoFAService.is2FactorAuthCodeValid(code, user);
    if (!isValidCode)
      throw new UnauthorizedException('Invalid authentication code');

    this._usersService.enable2FactorAuth(user.id);
  }

  // TODO: implement turn-off  functionality for 2fa.

  @Post('authenticate/:id')
  async authenticate(
    @Param('id') id: number,
    @Body() { code }: TwoFACodeDto,
    @Res() response: Response,
  ) {
    const user = await this._usersService.findById(id);
    const isValidCode = this._twoFAService.is2FactorAuthCodeValid(code, user);
    if (!isValidCode)
      throw new UnauthorizedException('Invalid authentication code');

    this._authService.sendJwtAccessToken(response, user, true);
  }
}
