import {Component, ViewChild} from "@angular/core";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient} from "@angular/common/http";
import {User} from "../../shared/user";
import {environment} from "../../../environments/environment";
import {NgForm} from "@angular/forms";
import {OAuthService} from "../../login/oauth.service";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'account-tab',
  templateUrl: 'account-tab.component.html',
  styleUrls: ['account-tab.component.scss']
})
export class AccountTabComponent {
  editNickname: boolean;

  user: BehaviorSubject<User>;
  qrCode = false;

  @ViewChild('t') tooltip: NgbTooltip;

  constructor(private http: HttpClient, public oauthService: OAuthService) {
    this.user = oauthService.user$;
  }


  updateNickname(nicknameForm: NgForm) {
    // this.http.post(`${environment.apiBaseUrl}/users/${this.}`)
    nicknameForm.controls['nickname'].setErrors({error: 'nickname already taken'})
    this.tooltip.open();
    console.log(nicknameForm);
  }

  showQRCode() {
    this.qrCode = true;
  }

  closeQRCode() {
    this.qrCode = false;
  }

  verifyCode(code: string) {
    console.log(code);
    this.oauthService.enable2FA();
    this.closeQRCode();
  }

  remove2FA() {
    this.oauthService.disable2FA();
  }

  isValidNickname(nicknameForm: NgForm) {
    if (!nicknameForm.valid || !nicknameForm.dirty || nicknameForm.value.nickname == this.user.value.name) {
      return true;
    }
    return false;
  }
}
