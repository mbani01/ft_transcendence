import {Component, ViewChild} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User} from "../../../shared/user";
import {environment} from "../../../../environments/environment";
import {ChatService} from "../../chat.service";
import {BehaviorSubject} from "rxjs";
import {NgForm} from "@angular/forms";
import {MainSocket} from "../../../socket/MainSocket";
import {OAuthService} from "../../../login/oauth.service";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'chat-settings',
  templateUrl: 'chat-settings.component.html',
  styleUrls: ['chat-settings.component.scss']
})
export class ChatSettingsComponent {

  members = new BehaviorSubject<User[]>([]);
  mutes = new BehaviorSubject<User[]>([]);
  bans = new BehaviorSubject<User[]>([]);

  editName = false;
  editPassword = false;

  leaveConfirm = false;

  activeTab = 'members';
  // roomName = this.chatService.currChat!.name;
  // nickname: any;
  @ViewChild('t') tooltip: NgbTooltip;

  constructor(private http: HttpClient,
              public chatService: ChatService,
              private socket: MainSocket,
              public oauthService: OAuthService)
  {
    this.socket.on('ban', this.onBan);
    this.socket.on('unban', this.onBan);
    this.socket.on('mute', this.onMute);
    this.socket.on('unmute', this.onMute);
    this.fetchMembers();
    this.fetchMutes();
    this.fetchBans();
  }

  get name() {
    return this.chatService.currChat!.name;
  }

  saveName(roomNameForm: NgForm) {
    this.editName = false;
    this.http.patch(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/update-name`,
      roomNameForm.value).subscribe({
      next: value => {

      },
      error: err => {

      }
    });
  }

  savePassword(roomPasswordForm: NgForm) {
    this.editPassword = false;
    this.http.patch(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/update-password`,
      roomPasswordForm.value).subscribe({
      next: value => {

      },
      error: err => {

      }
    });

  }

  unmute(member: User) {
    this.socket.emit('unmute', {
      roomID: this.chatService.currChat!.roomID,
      uid: member.uid
    }, (err: any) => {
      if (!err.error) {
        this.fetchMutes();
      }
    })
  }

  unban(member: User) {
    this.socket.emit('unban', {
      roomID: this.chatService.currChat!.roomID,
      uid: member.uid
    }, (err: any) => {
      if (!err.error) {
        this.fetchBans();
        this.fetchMembers();
      }
    })
  }

  sendInvite(inviteForm: NgForm) {
    this.chatService.sendInvite(inviteForm.value, (err: any) => {
      if (err.error) {
        inviteForm.controls['nickname'].setErrors(err);
        this.tooltip.open();
      }
    });
    inviteForm.reset();
  }

  leaveChannel() {
    if (!this.leaveConfirm) {
      this.leaveConfirm = true;
    } else {
      this.chatService.leaveChannel();
      this.leaveConfirm = false;
    }
  }

  fetchMembers() {
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
  fetchMutes() {
    this.http.get<User[]>(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/mutes`).subscribe({
      next: mutes => {
        this.mutes.next(mutes);
      }
    });
  }
  fetchBans() {
    this.http.get<User[]>(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/bans`).subscribe({
      next: bans => {
        this.bans.next(bans);
      }
    });
  }

  onBan = (ban: {roomID: string, userID: string}) => {
    console.log('onBan');
    this.fetchBans();
    this.fetchMembers()
  }
  onMute = () => {
    console.log('onMute');
    this.fetchMutes();
  }
}
