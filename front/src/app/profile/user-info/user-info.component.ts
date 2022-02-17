import {Component, Input, OnInit} from '@angular/core';
import {UserInfo} from "../model/user-info.model";
import {User} from "../../shared/user";

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

  constructor() { }

  ngOnInit(): void {
  }

  addFriend() {
    this.isFriend = true;
  }

  removeFriend() {
    this.isFriend = false;
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
