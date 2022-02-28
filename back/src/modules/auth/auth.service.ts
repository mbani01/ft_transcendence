import { Injectable, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { Response } from "express";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entity/user.entity";
@Injectable()
export class AuthService {
  constructor(private readonly _jwtService: JwtService, public readonly _configService: ConfigService ) { }
  async getAccessToken(code: string): Promise<string> {
    const payload = {
      grant_type: "authorization_code",
      client_id: this._configService.get<string>('APP_UID'),
      client_secret: this._configService.get<string>('APP_SECRET'),
      redirect_uri: this._configService.get<string>('APP_REDIRECT_URI'),
      code,
    };

    let ret: string;
    await axios({
      method: "post",
      url: "https://api.intra.42.fr/oauth/token",
      data: JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
      },
    })
      .then(function (res) {
        ret = res.data.access_token;
      })
      .catch((err) => console.log(err));
    return ret;
  }

  async getUserData(code: string): Promise<CreateUserDto> {
    let access_token: string;
    let userData: CreateUserDto;
    try {
      access_token = await this.getAccessToken(code);
      await axios({
        method: "GET",
        url: "https://api.intra.42.fr/v2/me",
        headers: {
          authorization: `Bearer ${access_token}`,
          "content-type": "application/json",
        },
      })
        .then(function (res) {
          const { email, login: username, image_url: avatar } = res.data;
          userData = { username, email, avatar };
        })
        .catch((err) => console.log(err));
    } catch (err: any) {
      console.log(err);
    }
    return userData;
  }

  async sendJwtAccessToken(@Res() response: Response, user: User, is2fa: boolean, isFirstTime: boolean) {
    const { access_token } = await this.loginJWT(user, is2fa);
    response
      .cookie("access_token", access_token, {
        httpOnly: true,
        domain: process.env.DOMAIN, // your domain here!
      })
      .send({
        uid: user.id,
        name: user.username,
        img: user.avatar,
        firstTime: isFirstTime,
      });
  }

  async loginJWT(user: User, is2fa: boolean) {
    const payload = { username: user.username, sub: user.id, img: user.avatar, is2faEnabled: user.is2FAEnabled };
    return { access_token: await this._jwtService.signAsync(payload) };
  }
}
