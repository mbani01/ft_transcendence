import { Component, EventEmitter, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ActivatedRoute, Router } from "@angular/router";
import { OAuthService } from "../oauth.service";
import { Observer } from "rxjs";

@Component({
  selector: 'two-factor-auth',
  templateUrl: 'two-factor-auth.component.html',
  styleUrls: ['two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent {

  private readonly code: string;
  // public is2FA = false;
  public loading = false;
  public is2FA = false;
  @Output() fail = new EventEmitter();

  constructor(private http: HttpClient, private route: ActivatedRoute, public oauthService: OAuthService, private router: Router) {
    this.code = route.snapshot.queryParams['code'];

    this.oauthService.generateAccessToken(this.code, undefined, {
      error: err => {
        if (err.error["is2FA"]) {
          this.is2FA = true;
        } else {
          this.fail.emit();
          router.navigate(['login']);
        }
      }
    });
  }

  verify(twoFactorAuth: NgForm) {
    let twoFactorAuthCode = twoFactorAuth.value['twoFactorAuth'];
    this.loading = true;
    this.oauthService.generateAccessToken(this.code, twoFactorAuthCode, {
      next: value => {
        this.loading = false;
        this.oauthService.enable2FA();
      },
      error: (err: HttpErrorResponse) => {
        twoFactorAuth.controls['twoFactorAuth'].setErrors({error: err.error.message});
        this.loading = false;
      }
    });
  }
}
