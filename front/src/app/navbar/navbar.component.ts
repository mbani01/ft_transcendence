import { Component, OnInit } from '@angular/core';
import {OAuthService} from "../login/oauth.service";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {User} from "../shared/user";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  users: Observable<User[]>;
  loading: boolean = true;
  constructor(private http: HttpClient, public oauthService: OAuthService, private router: Router) { }

  ngOnInit(): void {

  }

  search(event: any) {
    console.log('input');
    this.loading = true;
    this.users = this.http.get<User[]>(`${environment.apiBaseUrl}/users`, {
      params: {
        username: event.target.value
      }
    });
    this.users.subscribe({
      next: value => {
        this.loading = false
      }
    })
  }

  logout() {
    this.oauthService.logout();
    this.router.navigate(['/login']);
  }
}
