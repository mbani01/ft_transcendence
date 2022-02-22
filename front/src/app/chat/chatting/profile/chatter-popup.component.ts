import {Component, Input} from "@angular/core";
import {User} from "../../../shared/user";
import {NgbPopover} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {Chat} from "../../shared/chat.model";
import {OAuthService} from "../../../login/oauth.service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'chatter-popup',
  templateUrl: 'chatter-popup.component.html',
  styleUrls: ['chatter-popup.component.scss']
})
export class ChatterPopupComponent {
  @Input() user: User;
  @Input() chatRoom?: Chat;
  @Input() popover: NgbPopover;
  constructor(private router: Router, public oauthService: OAuthService, private http: HttpClient) {
    setTimeout(() => console.log(this.chatRoom));
  }

  // ngAfterViewInit() {
  //   let input = <HTMLInputElement>document.getElementsByClassName('ngb-tp-input').item(0);
  //   input.maxLength = 6;
  //   // @ts-ignore
  //   console.log(input.);// = (value) => {console.log(value)};
  // }

  mute(hours: string, minutes: string) {
    // this.http.
    this.popover.close();
  }

  ban() {

    this.popover.close();
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
