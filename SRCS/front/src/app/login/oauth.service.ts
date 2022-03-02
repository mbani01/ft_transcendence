import {Injectable} from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { User } from "../shared/user";
import { BehaviorSubject, Observer } from "rxjs";
import { UserInfo } from "./models/UserInfo.model";
import {NotifierService} from "angular-notifier";
import {MainSocket} from "../socket/MainSocket";

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private _authorized?: boolean;
  private _is2FA = false;
  // @ts-ignore
  public user$: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  public reload: boolean = false;

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router,
              private notifierService: NotifierService, private socket: MainSocket) {

    this.http.get<UserInfo>(`${environment.apiBaseUrl}/auth/isAuthorized`).subscribe({
      next: value => {
        this._authorized = true;
        this.user$.next({uid: value.id, name: value.username, img: value.avatar!});
        if (value.is2FAEnabled) {
          this.enable2FA();
        }
      },
      error: err => {
        this._authorized = false;
        if (!router.url.startsWith('/login')) {
          this.router.navigate(['login']);
          this.notifierService.notify('error', 'You are not authorized, Please Login');
        }
      }
    })
    // setTimeout(() => {
    //   this.fetchUser();
    // })
  }

  getAuthPage() {
    return this.http.get<{ page: string }>(environment.apiBaseUrl + '/auth/oauth_page');
  }

  generateAccessToken(code: string, _2fa?: string, observer?: Partial<Observer<Object>> | undefined) {
    let params = new HttpParams().set("code", code);
    if (_2fa != undefined) {
      params = params.set("twoFactorAuth", _2fa);
    }
    let obs = this.http.post<any>(environment.apiBaseUrl + '/auth/access_token', null, {
      params: params
    });
    obs.subscribe({
      next: (value) => {
        this.socket.connect();

        if (value.firstTime) {
          this.router.navigate(['account', 'settings'], {queryParams: {firstTime: true}});
        } else {
          this.router.navigate(['']);
        }
        this._authorized = true;
        if (value.is2FA) {
          this.enable2FA();
        }
        this.user$.next(value);
        if (observer?.next) {
          observer?.next(value);
        }
      },
      error: (err) => {
        if (observer?.error) {
          observer?.error(err);
        }
      }
    });
    return obs;
  }

  isAuthenticated() {
    return this._authorized;
  }

  isMe(user: User) {
     return user.uid === this.user?.uid;
  }

  get user() {
    return this.user$.value;
  }

  logout() {
    // this.cookieService.delete('access_token', '/');
    this.http.delete(`${environment.apiBaseUrl}/auth/logout`).subscribe({
      next: value => {
        this.socket.disconnect();
        this.router.navigate(['login']);
        this._authorized = false;

      }
    });
  }


  is2FAEnabled() {
    return this._is2FA;
  }

  enable2FA() {
    this._is2FA = true;
  }

  disable2FA() {
    this._is2FA = false;
  }
}
