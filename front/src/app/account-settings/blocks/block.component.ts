import {Component} from "@angular/core";
import {User} from "../../shared/user";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {OAuthService} from "../../login/oauth.service";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'blocks-list',
  templateUrl: 'block.component.html',
  styleUrls: ['block.component.scss']
})
export class BlockComponent {
  blockList = new BehaviorSubject<User[]>([]);

  constructor(private http: HttpClient, private oauthService: OAuthService) {
    this.http.get<User[]>(`${environment.apiBaseUrl}/users/${oauthService.user.uid}/block`).subscribe({
      next: value => {
        this.blockList.next(value);
      }
    });
  }

  unblock(block: User) {
    
  }
}
