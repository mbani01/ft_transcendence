import { Component, OnInit } from '@angular/core';
import {MatchHistory} from "./model/match-history.model";
import {User} from "../shared/user";
import {UserInfo} from "./model/user-info.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: User;
  matchHistory: MatchHistory[];
  userInfo: UserInfo;
  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
    route.params.subscribe( {
      next: (value) => {
        console.log(value);
        this.http.get(`${environment.apiBaseUrl}users/${value['id']}`).subscribe({
          next: () => {
            console.log("fetch user info");
            this.loadUser(value['id']);
            this.loadUserInfo(value['id']);
            this.loadMatchHistory(value['id']);
          },
          error: (err) => {
            console.log(err);
            this.router.navigateByUrl('/not-found', {skipLocationChange: true})
          }
        });
      }
    })
  }

  ngOnInit() {
  }

  loadUserInfo(user: string) {
    this.http.get<UserInfo>(`${environment.apiBaseUrl}userInfo/${user}`).subscribe({
      next: userInfo => {
        this.userInfo = userInfo;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  loadUser(user: string) {
    this.http.get<User>(`${environment.apiBaseUrl}users/${user}`).subscribe({
      next: user => {
        this.user = user;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  loadMatchHistory(user: string) {
    this.http.get<MatchHistory[]>(`${environment.apiBaseUrl}matchHistory/${user}`).subscribe({
      next: matchHistory => {
        this.matchHistory = matchHistory;
      },
      error: err => {
        console.log(err);
      }
    });
  }

}
