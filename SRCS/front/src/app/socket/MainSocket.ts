import {Socket} from "ngx-socket-io";
import {CookieService} from "ngx-cookie-service";
import {environment} from "../../environments/environment";
import {Injectable} from "@angular/core";

@Injectable()
export class MainSocket extends Socket {
  constructor(private cookieService: CookieService) {
    super({url: environment.socketUri, options: {} });

    this.ioSocket['auth'] = {token: cookieService.get('access_token')};
  }

}
