import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";
import {User} from "../shared/user";
import {BehaviorSubject, catchError, Observer, throwError} from "rxjs";
import {UserInfo} from "./models/UserInfo.model";

@Injectable({
  providedIn: 'root'
})
export class OAuthService {

  private _authorized?: boolean;
  private _is2FA = false;
  // @ts-ignore
  public user$: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) {
    console.log('OAuth Service');
    // this.access_token =;
    this.http.get<UserInfo>(`${environment.apiBaseUrl}/auth/isAuthorized`).subscribe({
      next: value => {
        console.log('IS_AUTH');
        console.log(value);
        this._authorized = true;
        console.log("Authorized");
        this.user$.next({
          uid: value.id,
          name: value.username,
          img: value.avatar!
        });
        if (value.is2FAEnabled) {
          this.enable2FA();
        }
      },
      error: err => {
        this._authorized = false;
        console.log("Not Authorized");
        console.log(router.url);
        if (!router.url.startsWith('/login')) {
          this.router.navigate(['login']);
        }
      }
    })
    // setTimeout(() => {
    //   this.fetchUser();
    // })
  }

  getAuthPage() {
    return this.http.get<{page: string}>(environment.apiBaseUrl + '/auth/oauth_page');
  }

  generateAccessToken(code: string, _2fa?: string, observer?: Partial<Observer<Object>> | undefined) {
    let params = new HttpParams().set("code", code);
    if (_2fa != undefined) {
      params = params.set("twoFactorAuth", _2fa);
    }
    console.log('GENERATE');
    let obs = this.http.post<any>(environment.apiBaseUrl + '/auth/access_token', null, {
      params: params
    });
    obs.subscribe({
      next: (value) => {
        console.log('TOKEN');
        // console.log(this.cookieService'access_token'));
        this.router.navigate(['']);
        this._authorized = true;
        if (value.is2FA) {
          this.enable2FA();
        }
        // this.cookieService.set('access_token', this.access_token, undefined, '/');
        // this.user$.next(token.user);
        if (observer?.next) {
          observer?.next(value);
        }
      },
    error: (err) => {
        if (observer?.error) {
          observer?.error(err);
        }
    }});
    return obs;
  }

  isAuthenticated() {
    return this._authorized;
  }

  get user() {
    return this.user$.value;
  }

  fetchUser() {
    this.http.get<User>(`${environment.apiBaseUrl}/users/me`).subscribe({
      next: value => {
        this.user$.next(value);
      },
      error: err => {
        console.log(err);
      }
    });
  }

  logout() {
    // this.cookieService.delete('access_token', '/');
    this.http.delete(`${environment.apiBaseUrl}/auth/logout`).subscribe({
      next: value => {
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
