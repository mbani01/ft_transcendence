import {Component} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User} from "../../../shared/user";
import {environment} from "../../../../environments/environment";
import {ChatService} from "../../chat.service";
import {BehaviorSubject} from "rxjs";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'chat-settings',
  templateUrl: 'chat-settings.component.html',
  styleUrls: ['chat-settings.component.scss']
})
export class ChatSettingsComponent {

  members = new BehaviorSubject<User[]>([]);

  editName = false;
  editPassword = false;

  activeTab = 'members';
  // roomName = this.chatService.currChat!.name;
  // nickname: any;

  constructor(private http: HttpClient, private chatService: ChatService) {
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
    console.log(roomNameForm.value);
    this.editName = false
  }

  savePassword(roomPasswordForm: NgForm) {
    console.log(roomPasswordForm.value);
    this.editPassword = false
  }

  unmute(member: User) {
    console.log('unmute ' + member.uid);
    this.http.post(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/unmute`, {
      uid: member.uid,
    });
  }

  unban(member: User) {
    console.log('unban ' + member.uid);
    this.http.post(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/unban`, {
      uid: member.uid,
    });
  }

  sendInvite(inviteForm: NgForm) {
    this.chatService.sendInvite(inviteForm.value);
  }
}
