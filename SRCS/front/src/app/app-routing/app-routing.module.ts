import { NgModule } from '@angular/core';

import {RouterModule, Routes} from "@angular/router";
import {EmptyComponent} from "../empty/empty.component";
import {NotFoundComponent} from "../not-found/not-found.component";
import {AuthGuard} from "../login/auth.guard";
import {ChatRoomsComponent} from "../chat/chat-rooms/chat-rooms.component";
import {LeaderboardComponent} from "../leaderboard/leaderboard.component";
import {AccountSettingsComponent} from "../account-settings/account-settings.component";
import {GameComponent} from "../game/game.component";
import {FriendsComponent} from "../account-settings/friends/friends.component";
import {BlockComponent} from "../account-settings/blocks/block.component";
import {AccountTabComponent} from "../account-settings/account/account-tab.component";
import {GameGuard} from "../game/game.guard";

const routes: Routes = [
  {path: '', canActivate: [AuthGuard], children: [
    {path: '', redirectTo: 'play', pathMatch: 'full'},
    {path: 'play', component: GameComponent, canDeactivate: [GameGuard]},
    {path: 'leaderboard', component: LeaderboardComponent},
    {path: 'chat-rooms', component: ChatRoomsComponent},
    {path: 'profile', loadChildren: () => import('src/app/profile/profile.module').then(m => m.ProfileModule)},
    {path: 'edit', component: EmptyComponent},
    {path: 'account', component: AccountSettingsComponent, children: [
        {path: 'settings', component: AccountTabComponent},
        {path: 'friends', component: FriendsComponent},
        {path: 'blocks', component: BlockComponent}
      ]},
    {path: '**', component: NotFoundComponent}
    ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

