import {Component} from "@angular/core";
import {User} from "../../shared/user";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {OAuthService} from "../../login/oauth.service";
import {BehaviorSubject} from "rxjs";
import {ChatService} from "../../chat/chat.service";
import {Chat} from "../../chat/shared/chat.model";

@Component({
  selector: 'friends-list',
  templateUrl: 'friends.component.html',
  styleUrls: ['friends.component.scss']
})
export class FriendsComponent {
  friends = new BehaviorSubject<(User)[]>([]);

  constructor(private http: HttpClient, private oauthService: OAuthService, private chatService: ChatService) {
    this.http.get<(User)[]>(`${environment.apiBaseUrl}/users/friends`).subscribe({
      next: value => {
        console.log(value);
        value[0].status = 'online';
        this.friends.next(value);
      }
    });
  }

  directMessage(friend: User) {
    // this.chatService.currChat = {
    //   isChannel: false, messages: [], name: friend.name, roomID: "0", unread: 0
    // };

    this.chatService.openConversation(friend);
    // this.chatService.openChat('0');
  }
}
