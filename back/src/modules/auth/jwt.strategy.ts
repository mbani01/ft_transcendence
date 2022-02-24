import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";

function getJwtFromCoockie(req): string {
  if (!req.headers.cookie) return '';
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
      secretOrKey: `${process.env.JWT_KEY}`,
    });
  }

  async validate(payload: any) {
    const user = await this._usersService.findById(payload.sub);
    if (!user) return;
    return user;
    // if (!user.is2FAEnabled) return user;
    // if (payload.is2fa) return user;
  }
}
