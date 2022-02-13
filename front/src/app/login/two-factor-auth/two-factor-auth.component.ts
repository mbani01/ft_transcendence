import {Component} from "@angular/core";
import {NgForm} from "@angular/forms";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {OAuthService} from "../oauth.service";

@Component({
  selector: 'two-factor-auth',
  templateUrl: 'two-factor-auth.component.html',
  styleUrls: ['two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent {

  private readonly code: string;
  // public is2FA = false;
  public loading = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, public oauthService: OAuthService) {
    this.code = route.snapshot.queryParams['code'];
    this.oauthService.generateAccessToken(this.code);
  }

  verify(twoFactorAuth: NgForm) {
    let twoFactorAuthCode = twoFactorAuth.value['twoFactorAuth'];
    console.log(twoFactorAuth);
    this.loading = true;
    this.oauthService.generateAccessToken(this.code, twoFactorAuthCode).subscribe({
      error: (err: HttpErrorResponse) => {
        twoFactorAuth.controls['twoFactorAuth'].setErrors(err.error);
        this.loading = false;
      }
    });
  }
}
