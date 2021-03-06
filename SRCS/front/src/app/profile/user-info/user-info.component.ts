import {Component, Input, OnInit} from '@angular/core';
import {UserInfo} from "../model/user-info.model";
import {User} from "../../shared/user";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {OAuthService} from "../../login/oauth.service";
import {ChatService} from "../../chat/chat.service";
import {GameService} from "../../game/game.service";
import {NotifierService} from "angular-notifier";

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

  constructor(private http: HttpClient, public oauthService: OAuthService, private chatService: ChatService,
              private gameService: GameService, private notifierService: NotifierService) { }

  ngOnInit(): void {
  }

  addFriend() {
    // this.isFriend = true;
    this.http.post(`${environment.apiBaseUrl}/users/add_friend`,
      {
        userID: this.user.uid
      }).subscribe({
      next: value => {
        this.userInfo.isFriend = true;
        this.userInfo.isBlocked = false;
      },
      error: err => {
        if (err?.error?.message) {
          this.notifierService.notify('error', err.error.message);
        }
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
    this.http.post(`${environment.apiBaseUrl}/users/block`,
      {
        userID: this.user.uid
      }).subscribe({
      next: value => {
        this.userInfo.isBlocked = true;
        this.userInfo.isFriend = false;
      },
      error: err => {
        if (err?.error?.message) {
          this.notifierService.notify('error', err.error.message);
        }
      }
    });

  }

  unblockUser() {
    this.http.patch(`${environment.apiBaseUrl}/users/unblock`,
      {
        userID: this.user.uid
      }).subscribe({
      next: value => {
        this.userInfo.isBlocked = false;
      }
    });

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

  directMessage() {
    this.chatService.openConversation(this.user);
  }

  inviteGame() {
    this.gameService.invitePlay(this.user);
  }

  getStatusColor() {
    if (this.userInfo.status === 'online') {
      return '#00D04E'
    } else if (this.userInfo.status === 'in-game') {
      return '#D4AA04';
    } else {
      return '#d40404';
    }
  }
}
