import {Component, EventEmitter, Input, Output} from "@angular/core";
import {User} from "../../../shared/user";
import {NgbPopover} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {Chat} from "../../shared/chat.model";
import {OAuthService} from "../../../login/oauth.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {MainSocket} from "../../../socket/MainSocket";

@Component({
  selector: 'chatter-popup',
  templateUrl: 'chatter-popup.component.html',
  styleUrls: ['chatter-popup.component.scss']
})
export class ChatterPopupComponent {
  @Input() user: User;
  @Input() chatRoom?: Chat;
  @Input() popover: NgbPopover;
  constructor(private router: Router, public oauthService: OAuthService, private http: HttpClient,
              private socket: MainSocket) {
    setTimeout(() => console.log(this.chatRoom));
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
