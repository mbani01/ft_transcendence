import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RoutingModule} from "./routing.module";
import {ProfileComponent} from "./profile.component";
import {UserInfoComponent} from "./user-info/user-info.component";
import {MatchHistoryComponent} from "./match-history/match-history.component";
import {DateAgoPipe} from "./pipes/date-ago.pipe";
import {RankPipe} from "./pipes/rank.pipe";
import {GameLengthPipe} from "./pipes/game-length.pipe";



@NgModule({
  declarations: [
    ProfileComponent,
    UserInfoComponent,
    MatchHistoryComponent,
    DateAgoPipe,
    RankPipe,
    GameLengthPipe
  ],
  imports: [
    CommonModule,
    RoutingModule
  ]
})
export class ProfileModule { }
