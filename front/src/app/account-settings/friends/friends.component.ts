import {Component} from "@angular/core";
import {User} from "../../shared/user";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {OAuthService} from "../../login/oauth.service";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'friends-list',
  templateUrl: 'friends.component.html',
  styleUrls: ['friends.component.scss']
})
export class FriendsComponent {
  friends = new BehaviorSubject<User[]>([]);

  constructor(private http: HttpClient, private oauthService: OAuthService) {
    this.http.get<User[]>(`${environment.apiBaseUrl}/users/${oauthService.user.uid}/friends`).subscribe({
      next: value => {
        this.friends.next(value);
      }
    });
  }
}
