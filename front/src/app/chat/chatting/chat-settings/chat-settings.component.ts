import {Component} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User} from "../../../shared/user";
import {environment} from "../../../../environments/environment";
import {ChatService} from "../../chat.service";
import {BehaviorSubject} from "rxjs";
import {NgForm} from "@angular/forms";
import {MainSocket} from "../../../socket/MainSocket";
import {OAuthService} from "../../../login/oauth.service";

@Component({
  selector: 'chat-settings',
  templateUrl: 'chat-settings.component.html',
  styleUrls: ['chat-settings.component.scss']
})
export class ChatSettingsComponent {

  members = new BehaviorSubject<User[]>([]);

  editName = false;
  editPassword = false;

  leaveConfirm = false;

  activeTab = 'members';
  // roomName = this.chatService.currChat!.name;
  // nickname: any;

  constructor(private http: HttpClient,
              private chatService: ChatService,
              private socket: MainSocket,
              public oauthService: OAuthService)
  {
    this.http.get<{
      id: number,
      username: string,
      avatar: string
    }[]>(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/members`).subscribe({
      next: members => {
        this.members.next(members.map(value => ({
          uid: value.id,
          name: value.username,
          img: value.avatar
        } as User)));
      }
    });
  }

  get name() {
    return this.chatService.currChat!.name;
  }

  saveName(roomNameForm: NgForm) {
    this.editName = false
  }

  savePassword(roomPasswordForm: NgForm) {
    this.editPassword = false
  }

  unmute(member: User) {
    this.http.post(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/unmute`, {
      uid: member.uid,
    });
  }

  unban(member: User) {
    this.http.post(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/unban`, {
      uid: member.uid,
    });
  }

  sendInvite(inviteForm: NgForm) {
    this.chatService.sendInvite(inviteForm.value);
  }

  leaveChannel() {
    if (!this.leaveConfirm) {
      this.leaveConfirm = true;
    } else {
      this.chatService.leaveChannel();
      this.leaveConfirm = false;
    }
  }

}
