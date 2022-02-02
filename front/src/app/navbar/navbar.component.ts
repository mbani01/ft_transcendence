import { Component, OnInit } from '@angular/core';
import {OAuthService} from "../login/oauth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(private oauthService: OAuthService, private router: Router) { }

  ngOnInit(): void {

  }

  logout() {
    this.oauthService.logout();
    this.router.navigate(['/login']);
  }
}
