import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";
import { JwtConstants } from "./constants";

function getJwtFromCoockie(req): string {
  const token = req.headers.cookie
    .split('; ')
    .find((cookie: string) => cookie.startsWith('access_token'))
    .split('=')[1];
  return token;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly _usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([getJwtFromCoockie]),
      ignoreExpiration: false,
      secretOrKey: JwtConstants.jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this._usersService.findById(payload.sub);
    if (!user) return;
    if (!user.is2FAEnabled) return user;
    if (payload.is2fa) return user;
  }
}
