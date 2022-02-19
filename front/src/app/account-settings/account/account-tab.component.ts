import {Component, ViewChild} from "@angular/core";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpRequest} from "@angular/common/http";
import {User} from "../../shared/user";
import {environment} from "../../../environments/environment";
import {NgForm} from "@angular/forms";
import {OAuthService} from "../../login/oauth.service";
import {BehaviorSubject} from "rxjs";
import {ERROR} from "@angular/compiler-cli/src/ngtsc/logging/src/console_logger";

enum UploadStat{NO_UPLOAD, UPLOADING, DONE, ERROR}

@Component({
  selector: 'account-tab',
  templateUrl: 'account-tab.component.html',
  styleUrls: ['account-tab.component.scss']
})
export class AccountTabComponent {
  editNickname: boolean;
  UploadStat = UploadStat;

  user: BehaviorSubject<User>;
  qrCode: string;
  click2FA = false;

  progress: number;
  uploadStat = UploadStat.NO_UPLOAD;

  @ViewChild('t') tooltip: NgbTooltip;
  @ViewChild('codeToolTip') codeToolTip: NgbTooltip;

  constructor(private http: HttpClient, public oauthService: OAuthService) {
    this.user = oauthService.user$;
  }


  updateNickname(nicknameForm: NgForm) {
    this.http.post(`${environment.apiBaseUrl}/users/update_nickname`, nicknameForm.value).subscribe({
      next: value => {
        this.editNickname = false;
      },
      error: err => {
        nicknameForm.controls['nickname'].setErrors({error: 'nickname already taken'})
        this.tooltip.open();
      }
    });
  }

  showQRCode() {
    this.http.get<{qrcode: string}>(`${environment.apiBaseUrl}/twofa/register`).subscribe({
      next: value => {
        this.qrCode = value.qrcode;
      }
    });
  }

  closeQRCode() {
    this.qrCode = '';
  }

  verifyCode(qrCodeForm: NgForm) {
    this.click2FA = true;
    this.http.post<boolean>(`${environment.apiBaseUrl}/twofa/turnon`, qrCodeForm.value).subscribe({
      next: value => {
        this.click2FA = false;
        if (value) {
          this.oauthService.enable2FA();
          this.closeQRCode();
        }
      },
      error: err => {
        qrCodeForm.controls['code'].setErrors({error: err.error.message});
        this.click2FA = false;
        console.log(qrCodeForm);
        this.codeToolTip.open();

      }
    });
  }

  remove2FA() {
    this.http.get<string>(`${environment.apiBaseUrl}/twofa/turnoff`).subscribe({
      next: value => {
        this.oauthService.disable2FA();
      }
    });
  }

  isValidNickname(nicknameForm: NgForm) {
    if (!nicknameForm.valid || !nicknameForm.dirty || nicknameForm.value.nickname == this.user.value.name) {
      return true;
    }
    return false;
  }

  uploadType() {
    if (this.uploadStat == UploadStat.ERROR) {
      return 'danger';
    } else if (this.uploadStat == UploadStat.DONE) {
      return 'success';
    }
    return 'info';
  }

  uploadAvatar(event: Event) {
    let files = (<HTMLInputElement>event.target).files;
    if (files && files.length > 0) {
      this.uploadStat = UploadStat.UPLOADING;
      this.progress = 0;
      let file = files[0];
      console.log(file);
      let formData = new FormData();
      formData.append('uploadFile', file, file.name);
      this.http.post(`${environment.apiBaseUrl}/users/upload_avatar`, formData, {reportProgress: true, observe: 'events'})
        .subscribe({
          next: (event: any) => {
            if (event.type == HttpEventType.UploadProgress) {
              this.progress = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpRequest) {
              console.log('File is completely loaded!');
            }
          },
          error: err => {
            console.log('Upload Error:', err);
            this.uploadStat = UploadStat.ERROR;
            setTimeout(() => this.uploadStat = UploadStat.NO_UPLOAD, 6900);
          },
          complete: () => {
            console.log('Upload done');
            this.uploadStat = UploadStat.DONE;
            setTimeout(() => this.uploadStat = UploadStat.NO_UPLOAD, 2000);
          }
        });
    }
  }
}
