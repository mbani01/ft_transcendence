import {Component, TemplateRef, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {User} from "../shared/user";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {OAuthService} from "../login/oauth.service";

@Component({
  selector: 'account-settings',
  templateUrl: 'account-settings.component.html',
  styleUrls: ['account-settings.component.scss']
})
export class AccountSettingsComponent {
  active: string;

  constructor(private http: HttpClient, private oauthService: OAuthService) {
    this.http.get<User>(`${environment.apiBaseUrl}/users/me`).subscribe({
      next: (user) => {
        oauthService.user$.next(user);
      }
    });
  }

}
