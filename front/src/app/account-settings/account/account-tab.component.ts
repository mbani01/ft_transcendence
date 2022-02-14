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
  qrCode: string;
  click2FA = false;

  @ViewChild('t') tooltip: NgbTooltip;
  @ViewChild('codeToolTip') codeToolTip: NgbTooltip;

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
    // this.qrCode = 'data:image/png;base64,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';
    this.http.get<string>(`${environment.apiBaseUrl}/twofa/register`).subscribe({
      next: value => {
        this.qrCode = value;
      }
    });
  }

  closeQRCode() {
    this.qrCode = '';
  }

  verifyCode(qrCodeForm: NgForm) {
    this.click2FA = true;
    this.http.get<{is2FA: boolean, error: string}>(`${environment.apiBaseUrl}/twofa/turnon`, {
      params: qrCodeForm.value
    }).subscribe({
      next: value => {
        this.click2FA = false;
        if (value.is2FA) {
          this.oauthService.enable2FA();
          this.closeQRCode();
        } else if (value.error) {
          qrCodeForm.controls['code'].setErrors(value);
          console.log(qrCodeForm);
          this.codeToolTip.open();
        }
      }
    });
  }

  remove2FA() {
    this.http.get<string>(`${environment.apiBaseUrl}/twofa/turnoff`);
    this.oauthService.disable2FA();
  }

  isValidNickname(nicknameForm: NgForm) {
    if (!nicknameForm.valid || !nicknameForm.dirty || nicknameForm.value.nickname == this.user.value.name) {
      return true;
    }
    return false;
  }
}
