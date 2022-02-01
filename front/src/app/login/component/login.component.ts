import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {OAuthService} from "../oauth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private oauthService: OAuthService, private router: Router) {
    if (this.oauthService.isAuthenticated()) {
      this.router.navigate(['']);
    }
  }

  ngOnInit(): void {
  }

  login() {
    this.oauthService.getAuthPage().subscribe({
      next: (data) => {
        window.location.href = data.page;
      },
      error: error => console.log(error)
    });
  }
}
