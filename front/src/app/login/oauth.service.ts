import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";
import {User} from "../shared/user";
import {BehaviorSubject, catchError, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OAuthService {

  private access_token: string = '';
  private _is2FA = false;
  // @ts-ignore
  public user$: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) {
    console.log('OAuth Service');
    this.access_token = cookieService.get('access_token');
    setTimeout(() => {
      this.fetchUser();
    })
  }

  getAuthPage() {
    return this.http.get<{page: string}>(environment.apiBaseUrl + '/oauth_page');
  }

  generateAccessToken(code: string, _2fa?: string) {
    let params = new HttpParams().set("code", code);
    if (_2fa != undefined) {
      params = params.set("twoFactorAuth", _2fa);
    }
    console.log(params);
    let obs = this.http.post<{access_token: string, user: User}>(environment.apiBaseUrl + '/access_token', null, {
      params: params
    });
    obs.subscribe({
      next: (token) => {
        console.log(token);
        this.router.navigate(['']);
        this.access_token = token.access_token;
        this.cookieService.set('access_token', this.access_token, undefined, '/');
        this.user$.next(token.user);
      },
      error: (error => {
        if (error.error['2FA']) {
          this._is2FA = true;
        }
        console.log(error)
      }),
      // complete: () => this.router.navigate([''])
    });
    return obs;
  }

  isAuthenticated() {
    return this.access_token != '';
  }

  get token() {
    return this.access_token;
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
    this.cookieService.delete('access_token', '/');
    this.access_token = '';
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
