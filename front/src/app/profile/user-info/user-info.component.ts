import {Component, Input, OnInit} from '@angular/core';
import {UserInfo} from "../model/user-info.model";
import {User} from "../../shared/user";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  @Input() user: User;
  @Input() userInfo: UserInfo;

  isFriend: boolean = false;
  isBlocked: boolean = false;

  constructor(private http: HttpClient) { }

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
        this.isFriend = true;
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
        this.isFriend = false;
      }
    });

  }

  blockUser() {
    this.isBlocked = true;
  }

  unblockUser() {
    this.isBlocked = false;
  }

  friend() {
    if (this.isFriend) {
      this.removeFriend();
    } else {
      this.addFriend();
    }
  }

  block() {
    if (this.isBlocked) {
      this.unblockUser();
    } else {
      this.blockUser();
    }
  }
}
