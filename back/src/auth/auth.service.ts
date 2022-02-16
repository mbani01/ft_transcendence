import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import axios from "axios";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { User } from "src/users/entity/user.entity";
import { Response } from "express";
@Injectable()
export class AuthService {
  constructor(private readonly _jwtService: JwtService) { }
  async getAccessToken(code: string): Promise<string> {
    const payload = {
      grant_type: "authorization_code",
      client_id:
        "3983150b52dfbad3bcb15e2f02b31153d87a6b02004d039f8f1b2b09fae1c598",
      client_secret:
        "b41976899e9839019139e2c2c82fb901f4ea7c2cf12dd98a54d2dd8dccfc7c10",
      redirect_uri: "http://localhost:3000/login",
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
      await this.getAccessToken(code).then((res) => (access_token = res));
      console.log(access_token);
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
    console.log(access_token);
    return userData;
  }

  async sendJwtAccessToken(response: Response, user: User, is2fa: boolean) {
    const { access_token } = await this.loginJWT(user, is2fa);
    response
      .cookie("access_token", access_token, {
        httpOnly: true,
        domain: "localhost", // your domain here!
      })
      .send({ success: true });
  }

  async loginJWT(user: User, is2fa: boolean) {
    const payload = { username: user.username, sub: user.id, is2fa };
    return { access_token: await this._jwtService.signAsync(payload) };
  }
}
