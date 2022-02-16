import { Injectable } from "@nestjs/common";
import { GeneratedSecretObject } from "./interfaces/2fa.interface";
import * as QRCode from "qrcode";
import { authenticator } from "otplib";
import { UsersService } from "src/users/users.service";
import { ConfigService } from "@nestjs/config";
import { User } from "src/users/entity/user.entity";
import { Response } from "express";

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _config: ConfigService
  ) {}

  async generate2FASecret(user: User): Promise<GeneratedSecretObject> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.username,
      "TRANSENDNECE",
      secret
    );

    await this._usersService.set2FASecret(secret, user.id);
    return { secret, otpauthUrl };
  }

  async generateQRCode(otpauth_url: string) {
    let qrcodeResult = await QRCode.toDataURL(otpauth_url);
    return '<img src="' + qrcodeResult + '">';
  }

  is2FactorAuthCodeValid(twoFACode: string, user: User): boolean {
    return authenticator.verify({ token: twoFACode, secret: user.twoFASecret });
  }

  // async pipeOrCodeStream(stream: Response, otpauthUrl: string) {
  //   return toFileStream(stream, otpauthUrl);
  // }

  // generateSecret(): GeneratedSecret {
  //   const secret = speakeasy.generateSecret({
  //     name: "ft_transendence",
  //     length: 10,
  //   });
  //   const { base32, otpauth_url } = secret;
  //   return { base32, otpauth_url };
  // }

  // verifySecret(secret: string, token: string): boolean {
  //   return speakeasy.totp.verify({ secret, token: token, encoding: "base32" });
  // }
}
