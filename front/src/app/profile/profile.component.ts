import { Component, OnInit } from '@angular/core';
import {MatchHistory} from "./model/match-history.model";
import {User} from "../shared/user";
import {UserInfo} from "./model/user-info.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: User;
  matchHistory: MatchHistory[];
  userInfo: UserInfo;
  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.loadUser();
    this.loadUserInfo();
    this.loadMatchHistory();
  }


  ngOnInit() {
    console.log('Router');
    console.log(this.route.snapshot.params);
  }

  loadUserInfo() {
    this.http.get<UserInfo>(`${environment.apiBaseUrl}userInfo/${this.route.snapshot.params['id']}`).subscribe({
      next: userInfo => {
        this.userInfo = userInfo;
      }
    });
  }

  loadUser() {
    this.http.get<User>(`${environment.apiBaseUrl}users/${this.route.snapshot.params['id']}`).subscribe({
      next: user => {
        this.user = user;
      }
    });
  }

  loadMatchHistory() {
    this.http.get<MatchHistory[]>(`${environment.apiBaseUrl}matchHistory/${this.route.snapshot.params['id']}`).subscribe({
      next: matchHistory => {
        this.matchHistory = matchHistory;
      }
    });
  }

}
