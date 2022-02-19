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
    const user = req.user;
    const { otpauthUrl } = await this._twoFAService.generate2FASecret(user);
    await QRCode.toDataURL(otpauthUrl).then((result) => res.send(JSON.stringify({ qrcode: result })));
  }

  @UseGuards(JwtAuthGuard)
  @Post('/turnon')
  async trunOn2FA(@Body() twoFACode: any, @Req() req) {
    const { code } = twoFACode
    const user = req.user;
    console.log('user\'s secret:', user.twoFASecret);
    const isValidCode = this._twoFAService.is2FactorAuthCodeValid(code, user.twoFASecret);
    if (!isValidCode) {
      // this._usersService.unSet2FASecret(user.id);
      throw new UnauthorizedException('Invalid authentication code');
    }
    await this._usersService.enable2FactorAuth(user.id);
    return true;
  }

  // TODO: implement turn-off  functionality for 2fa.

  @Post('authenticate/:id')
  async authenticate(
    @Param('id') id: number,
    @Body() { code }: TwoFACodeDto,
  ) {
    const user = await this._usersService.findById(id);
    const isValidCode = this._twoFAService.is2FactorAuthCodeValid(code, user.twoFASecret);
    if (!isValidCode)
      throw new UnauthorizedException('Invalid authentication code');

    return true;
  }
}
