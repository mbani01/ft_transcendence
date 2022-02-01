import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {OAuthService} from "./login/oauth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ft_transcendence';
  constructor(public router: Router, public oauthService: OAuthService) {
  }

  ngOnInit() {
    console.log(this.oauthService.isAuthenticated());
  }
}
