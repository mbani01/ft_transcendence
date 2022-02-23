import {Component, EventEmitter, Input, Output} from "@angular/core";
import {User} from "../../../shared/user";
import {NgbPopover} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {Chat} from "../../shared/chat.model";
import {OAuthService} from "../../../login/oauth.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {MainSocket} from "../../../socket/MainSocket";
import {Observable} from "rxjs";

@Component({
  selector: 'chatter-popup',
  templateUrl: 'chatter-popup.component.html',
  styleUrls: ['chatter-popup.component.scss']
})
export class ChatterPopupComponent {
  @Input() user: User;
  @Input() chatRoom?: Chat;
  @Input() popover: NgbPopover;
  myRole: string
  userRole: string;
  constructor(private router: Router, public oauthService: OAuthService, private http: HttpClient,
              private socket: MainSocket) {
    setTimeout(() => {
      if (this.chatRoom) {
        this.http.get<{ role: string }>(`${environment.apiBaseUrl}/chat/${this.chatRoom!.roomID}/role/${this.oauthService.user.uid}`).subscribe({
          next: value => {
            this.myRole = value.role;
            console.log('this.userRole', this.myRole);
          }
        });
        this.http.get<{ role: string }>(`${environment.apiBaseUrl}/chat/${this.chatRoom!.roomID}/role/${this.user!.uid}`).subscribe({
          next: value => {
            this.userRole = value.role;
            console.log('this.userRole', this.userRole);
          }
        });

      }
    });
  }

  ngAfterContentInit() {
    // if (this.chatRoom) {
    //   this.http.get<{ role: string }>(`${environment.apiBaseUrl}/chat/${this.chatRoom!.roomID}/role/${this.user!.uid}`).subscribe({
    //     next: value => {
    //       this.userRole = value.role;
    //     }
    //   });
    // }
    // console.log('this.userRole', this.userRole);
  }

  mute(hours: string, minutes: string) {
    if (this.chatRoom) {
      this.socket.emit('mute', {
        roomID: this.chatRoom?.roomID,
        userID: this.user.uid,
        timeout: (+hours * 60 + +minutes) * 60 * 1000
      })
      this.popover.close();
    }
  }

  ban() {
    if (this.chatRoom) {
      this.socket.emit('ban', {
        roomID: this.chatRoom?.roomID,
        userID: this.user.uid,
      });
      this.popover.close();
    }
  }

  viewProfile() {
    this.router.navigate(['profile', this.user.uid]);
    this.popover.close();

  }

  invitePlay() {

    this.popover.close();

  }

  giveAdmin() {
    this.http.patch(`${environment.apiBaseUrl}/chat/${this.chatRoom!.roomID}/give-admin`, {
      userID: this.user.uid
    }).subscribe({
      next: () => {
        this.userRole = 'admin';
      }
    })
    this.popover.close();
  }

  revokeAdmin() {
    this.http.patch(`${environment.apiBaseUrl}/chat/${this.chatRoom!.roomID}/revoke-admin`, {
      userID: this.user.uid
    }).subscribe({
      next: () => {
        this.userRole = 'member';
      }
    })
    this.popover.close();
  }

  validate(input: HTMLInputElement) {
    let value = parseInt(input.value);

    if (isNaN(value) || value <= 0) {
      input.value = '0';
    } else if (parseInt(input.value) > 999999) {
      input.value = '999999';
    }
  }

}
