import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";
import {User} from "../shared/user";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OAuthService {

  private access_token: string = '';

  // @ts-ignore
  private _user: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) {
    console.log('OAuth Service');
    this.access_token = cookieService.get('access_token');
    setTimeout(() => {
      this.fetchUser();
    })
  }

  getAuthPage() {
    return this.http.get<{page: string}>(environment.apiBaseUrl + 'oauth_page');
  }

  generateAccessToken(code: string) {
    return this.http.post<{access_token: string, user: User}>(environment.apiBaseUrl + 'access_token', code).subscribe({
      next: (token) => {
        console.log(token);
        this.access_token = token.access_token;
        this.cookieService.set('access_token', this.access_token, undefined, '/');
        console.log(this.token);
        this._user.next(token.user);
      },
      error: (error => console.log(error)),
      complete: () => this.router.navigate([''])
    });
  }

  isAuthenticated() {
    return this.access_token != '';
  }

  get token() {
    return this.access_token;
  }

  get user() {
    return this._user.value;
  }

  fetchUser() {
    console.log('fetchUser');
    this.http.get<User>(`${environment.apiBaseUrl}users/me`).subscribe({
      next: value => {
        console.log(value);
        this._user.next(value);
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
}
