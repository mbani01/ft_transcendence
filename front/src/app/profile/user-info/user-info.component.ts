import {Component, Input, OnInit} from '@angular/core';
import {UserInfo} from "../model/user-info.model";
import {User} from "../../shared/user";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {OAuthService} from "../../login/oauth.service";

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  @Input() user: User;
  @Input() userInfo: UserInfo;

  // isFriend: boolean = false;
  // isBlocked: boolean = false;

  constructor(private http: HttpClient, public oauthService: OAuthService) { }

  ngOnInit(): void {
  }

  addFriend() {
    // this.isFriend = true;
    this.http.post(`${environment.apiBaseUrl}/users/add_friend`,
      {
        userID: this.user.uid
      }).subscribe({
      next: value => {
        console.log('add_friend', value);
        this.userInfo.isFriend = true;
      },
      error: err => {
        console.log('add_friend err', err);
      }
    });
  }

  removeFriend() {
    this.http.post(`${environment.apiBaseUrl}/users/remove_friend`,
      {
        userID: this.user.uid
      }).subscribe({
      next: value => {
        this.userInfo.isFriend = false;
      }
    });

  }

  blockUser() {
    this.userInfo.isBlocked = true;
  }

  unblockUser() {
    this.userInfo.isBlocked = false;
  }

  friend() {
    if (this.userInfo.isFriend) {
      this.removeFriend();
    } else {
      this.addFriend();
    }
  }

  block() {
    if (this.userInfo.isBlocked) {
      this.unblockUser();
    } else {
      this.blockUser();
    }
  }
}
