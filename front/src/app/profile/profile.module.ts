import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RoutingModule} from "./routing.module";
import {ProfileComponent} from "./profile.component";
import {UserInfoComponent} from "./user-info/user-info.component";
import {MatchHistoryComponent} from "./match-history/match-history.component";
import {DateAgoPipe} from "./pipes/date-ago.pipe";
import {RankPipe} from "./pipes/rank.pipe";
import {GameLengthPipe} from "./pipes/game-length.pipe";
import {UserAvatarComponent} from "./user-avatar/user-avatar.component";



@NgModule({
  declarations: [
    ProfileComponent,
    UserInfoComponent,
    MatchHistoryComponent,
    UserAvatarComponent,
    DateAgoPipe,
    RankPipe,
    GameLengthPipe
  ],
  imports: [
    CommonModule,
    RoutingModule
  ],
  exports: [UserAvatarComponent]
})
export class ProfileModule {
  constructor() {
  }
}
