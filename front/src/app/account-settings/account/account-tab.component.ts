import {ApplicationRef, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {NgbModal, NgbModalRef, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpRequest, HttpResponse} from "@angular/common/http";
import {User} from "../../shared/user";
import {environment} from "../../../environments/environment";
import {NgForm} from "@angular/forms";
import {OAuthService} from "../../login/oauth.service";
import {BehaviorSubject} from "rxjs";
import {NotifierService} from "angular-notifier";
import {ActivatedRoute, Router} from "@angular/router";

enum UploadStat{NO_UPLOAD, UPLOADING, DONE, ERROR}

@Component({
  selector: 'account-tab',
  templateUrl: 'account-tab.component.html',
  styleUrls: ['account-tab.component.scss']
})
export class AccountTabComponent implements OnInit{
  editNickname: boolean;
  UploadStat = UploadStat;

  user: BehaviorSubject<User>;
  qrCode: string;
  click2FA = false;

  progress: number;
  uploadStat = UploadStat.NO_UPLOAD;

  private modalRef?: NgbModalRef;

  @ViewChild('t') tooltip: NgbTooltip;
  @ViewChild('codeToolTip') codeToolTip: NgbTooltip;
  @ViewChild('accountInfoModal', {static:true}) accountInfoModal: TemplateRef<any>;

  constructor(private http: HttpClient, public oauthService: OAuthService, private notifierService: NotifierService,
              private router: Router, private route: ActivatedRoute, private ngbModal: NgbModal) {
    this.user = oauthService.user$;
  }
  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('firstTime')) {
        this.modalRef = this.ngbModal.open(this.accountInfoModal, {centered: true});
    }
  }


  updateNickname(nicknameForm: NgForm) {
    if (nicknameForm.value.nickname !== this.user.value.name) {
      this.http.post(`${environment.apiBaseUrl}/users/update_nickname`, nicknameForm.value).subscribe({
        next: value => {
          this.editNickname = false;
          this.user.value.name = nicknameForm.value.nickname;
          this.notifierService.notify('success', 'Nickname updated successfully');
          if (this.modalRef) {
            this.modalRef.close();
            this.router.navigate(['']);
          }
        },
        error: err => {
          this.notifierService.notify('error', err.error.message);
          nicknameForm.controls['nickname'].setErrors({error: err.error.message})
          this.tooltip.open();
        }
      });
      return true;
    }
    return false;
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
          this.notifierService.notify('success', 'Two-factor authentication is enabled');
          this.closeQRCode();
        }
      },
      error: err => {
        qrCodeForm.controls['code'].setErrors({error: err.error.message});
        this.click2FA = false;
        this.codeToolTip.open();

      }
    });
  }

  remove2FA() {
    this.http.get<string>(`${environment.apiBaseUrl}/twofa/turnoff`).subscribe({
      next: value => {
        this.oauthService.disable2FA();
        this.notifierService.notify('warning', 'Two-factor authentication is disabled');
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

  uploadAvatar(target: EventTarget | HTMLInputElement) {
    let files = (target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.uploadStat = UploadStat.UPLOADING;
      this.progress = 0;
      let file = files[0];
      let formData = new FormData();
      formData.append('file', file, file.name);
      this.http.post(`${environment.apiBaseUrl}/users/upload_avatar`, formData, {reportProgress: true, observe: 'events'})
        .subscribe({
          next: (event: any) => {
            if (event.type == HttpEventType.UploadProgress) {
              this.progress = Math.round(100 * event.loaded / event.total);
            } else if (event instanceof HttpResponse) {
              console.log('next2', event);
              this.user.value.img = event.body.avatar;
            }
          },
          error: err => {
            if (err.error) {
              this.notifierService.notify('error', err.error);
            }
            this.uploadStat = UploadStat.ERROR;
            setTimeout(() => this.uploadStat = UploadStat.NO_UPLOAD, 6900);
          },
          complete: () => {

            this.uploadStat = UploadStat.DONE;
            setTimeout(() => this.uploadStat = UploadStat.NO_UPLOAD, 2000);
          }
        });
    }
  }

  saveAccountInfo(save: {nickname: NgForm, avatar: HTMLInputElement}) {
    this.uploadAvatar(save.avatar);
    if (!this.updateNickname(save.nickname)) {
      this.modalRef?.close();
      this.router.navigate(['']);
    }
    // this.modal.close();
    // this.ngbModal.
  }
}
