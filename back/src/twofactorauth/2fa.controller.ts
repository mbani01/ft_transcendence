import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { TwoFactorAuthService } from './2fa.service';
import { Response } from 'express';
import * as QRCode from 'qrcode';
import { TwoFACodeDto } from './dto/two-fadto.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/entity/user.entity';

@Controller('twofa')
export class TwofactorauthController {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _twoFAService: TwoFactorAuthService,
    private readonly _authService: AuthService,
  ) {}

  @Get()
  test() {
    return 'this action returns test';
  }

  @UseGuards(JwtAuthGuard)
  @Post('/register')
  async register(@Req() req, @Res() res: Response) {
    const { username } = req.user;
    console.log(req.user);
    console.log(username);
    const user = await this._usersService.findByUserName(username);
    if (!user) throw new UnauthorizedException();
    const { otpauthUrl } = await this._twoFAService.generate2FASecret(user);
    await QRCode.toDataURL(otpauthUrl).then((result) => res.send(result));
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
