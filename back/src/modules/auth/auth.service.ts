import { Injectable, Res } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { Response } from "express";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entity/user.entity";
@Injectable()
export class AuthService {
  constructor(private readonly _jwtService: JwtService) { }
  async getAccessToken(code: string): Promise<string> {
    const payload = {
      grant_type: "authorization_code",
      client_id:
        "802dd62932bab69d1e0168a42ed0567a6b83267c134fb2f62d583c14b2a4ce97",
      client_secret:
        "90e1a8765ecb7d464e48b23b94843495e261dfa71d7facd9933ab0e1dc0d4096",
      redirect_uri: "http://localhost:4200/login",
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

  async sendJwtAccessToken(@Res() response: Response, user: User, is2fa: boolean) {
    const { access_token } = await this.loginJWT(user, is2fa);
    response
      .cookie("access_token", access_token, {
        httpOnly: true,
        domain: "localhost", // your domain here!
      })
      .send({ success: true });
  }

  async loginJWT(user: User, is2fa: boolean) {
    const payload = { username: user.username, sub: user.id, img: user.avatar };
    return { access_token: await this._jwtService.signAsync(payload) };
  }
}
