import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {OAuthService} from "../oauth.service";

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  public access_token: string = '';

  constructor(private router: ActivatedRoute, private http: HttpClient, private oauthService: OAuthService) {
  }

  ngOnInit(): void {
    this.oauthService.generateAccessToken(this.router.snapshot.queryParams['code']);
    //   () => console.log());    // let params = new HttpParams()
    //     //   .set('grant_type', 'authorization_code')
    //     //   .set('client_id', AppConfig.CLIENT_ID)
    //     //   .set('client_secret', AppConfig.CLIENT_SECRET)
    //     //   .set('code', this.router.snapshot.queryParams['code'])
    //     //   .set('redirect_uri', AppConfig.OAUTH_REDIRECT_URI);
    //     //
    //     //
    //     // this.http.post(AppConfig.OAUTH_TOKEN_URL, params).
    //     // subscribe(
    //     //   data => console.log(data),
    //     //   error => console.log(error),
  }

}
