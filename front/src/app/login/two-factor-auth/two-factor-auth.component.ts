import {Component} from "@angular/core";
import {NgForm} from "@angular/forms";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'two-factor-auth',
  templateUrl: 'two-factor-auth.component.html',
  styleUrls: ['two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent {

  private code: string;
  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.code = route.snapshot.queryParams['code'];
  }

  verify(twoFactorAuth: NgForm) {
    let params = new HttpParams()
      .append("code", this.code)
      .append("auth_code", twoFactorAuth.value['twoFactorAuth']);
    this.http.get(`${environment.apiBaseUrl}/login/access_token`, null)
    twoFactorAuth.controls['twoFactorAuth'].setErrors({error: 'HASDDOASDHOAO'});
  }
}
