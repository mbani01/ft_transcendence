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
import {NotifierService} from "angular-notifier";

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

  role: string;
  // roomName = this.chatService.currChat!.name;
  // nickname: any;
  @ViewChild('t') tooltip: NgbTooltip;

  constructor(private http: HttpClient,
              public chatService: ChatService,
              private socket: MainSocket,
              public oauthService: OAuthService,
              private notifierService: NotifierService)
  {
    this.socket.on('ban', this.onBan);
    this.socket.on('unban', this.onBan);
    this.socket.on('mute', this.onMute);
    this.socket.on('unmute', this.onMute);
    this.fetchMembers();
    this.fetchMutes();
    this.fetchBans();

    this.chatService.getRole(chatService.currChat!.roomID, oauthService.user.uid).then(value => this.role = value);
  }

  get name() {
    return this.chatService.currChat!.name;
  }

  saveName(roomNameForm: NgForm) {
    this.editName = false;
    if (roomNameForm.value.name !== '' && this.chatService.currChat!.name !== roomNameForm.value.name) {
      this.http.patch<{name: string}>(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/update-name`,
        roomNameForm.value).subscribe({
        next: value => {
          console.log(value);
          this.chatService.currChat!.name = value.name;
          this.notifierService.notify('success', 'Room name updated successfully');
        },
        error: err => {
          if (err.error) {
            this.notifierService.notify('error', err.error);
          }
        }
      });
    }
  }

  savePassword(roomPasswordForm: NgForm) {
    this.editPassword = false;
    this.http.patch(`${environment.apiBaseUrl}/chat/${this.chatService.currChat!.roomID}/update-password`,
      roomPasswordForm.value).subscribe({
      next: value => {
        this.notifierService.notify('success', 'Room password updated successfully');
      },
      error: err => {
        if (err.error) {
          this.notifierService.notify('error', err.error);
        }
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
        this.notifierService.notify('success', `${member.name} is unmuted`);
      } else {
        this.notifierService.notify('error', err.error);
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
        this.notifierService.notify('success', `${member.name} is unbanned`);
      } else {
        this.notifierService.notify('error', err.error);
      }
    })
  }

  sendInvite(inviteForm: NgForm) {
    this.chatService.sendInvite(inviteForm.value, (err: any) => {
      if (err.error) {
        inviteForm.controls['nickname'].setErrors(err);
        this.notifierService.notify('error', err.error);
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
