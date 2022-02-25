import {Component, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {OAuthService} from "./login/oauth.service";
import {NotifierService} from "angular-notifier";
import {GameService} from "./game/game.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ft_transcendence';

  @ViewChild('gameInvite', { static: true }) gameInviteTmpl: any;

  constructor(public router: Router, public oauthService: OAuthService, public gameService: GameService, private notifierService: NotifierService) {
    // setTimeout(() => {
    //   this.notifierService.show({
    //     message: 'yo',
    //     type: 'warning',
    //     template: this.gameInviteTmpl,
    //   });
    // }, 1000);
  }

  ngOnInit() {
    this.gameService.duelTmpl.next(this.gameInviteTmpl);

    console.log(this.gameInviteTmpl);
  }
}
