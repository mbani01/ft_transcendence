import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import { JwtConstants } from "./constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly _usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JwtConstants.jwtSecret,
    });
    console.log("strategy class called");
  }

  async validate(payload: any) {
    const user = await this._usersService.findById(payload.sub);
    if (!user) return;
    if (!user.is2FAEnabled) return user;
    if (payload.is2fa) return user;
  }
}
