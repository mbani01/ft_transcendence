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

  user?: User;
  userInfo?: UserInfo;
  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
    route.params.subscribe( {
      next: (value) => {
        this.http.get(`${environment.apiBaseUrl}/users/${value['id']}`).subscribe({
          next: () => {
            this.loadUser(value['id']);
            this.loadUserInfo(value['id']);
            // this.loadMatchHistory(value['id']);
          },
          error: (err) => {
            this.router.navigateByUrl('/not-found', {skipLocationChange: true})
          }
        });
      }
    })
  }

  ngOnInit() {
  }

  loadUserInfo(user: string) {
    this.http.get<any>(`${environment.apiBaseUrl}/users/user-info/${user}`).subscribe({
      next: userInfo => {
        this.userInfo = userInfo;
      },
      error: err => {
      }
    });
  }

  loadUser(user: string) {
    this.http.get<User>(`${environment.apiBaseUrl}/users/${user}`).subscribe({
      next: user => {
        this.user = user;
      },
      error: err => {
      }
    });
  }

  // loadMatchHistory(user: string) {
  //   this.http.get<MatchHistory[]>(`${environment.apiBaseUrl}/users/match-history/${user}`).subscribe({
  //     next: matchHistory => {
  //       this.matchHistory = matchHistory;
  //     },
  //     error: err => {
  //     }
  //   });
  // }

}
