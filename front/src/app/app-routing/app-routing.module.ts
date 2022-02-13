import { NgModule } from '@angular/core';

import {RouterModule, Routes} from "@angular/router";
import {EmptyComponent} from "../empty/empty.component";
import {NotFoundComponent} from "../not-found/not-found.component";
import {AuthGuard} from "../login/auth.guard";
import {ChatRoomsComponent} from "../chat/chat-rooms/chat-rooms.component";
import {LeaderboardComponent} from "../leaderboard/leaderboard.component";
import {AccountSettingsComponent} from "../account-settings/account-settings.component";

const routes: Routes = [
  {path: '', canActivate: [AuthGuard], children: [
    {path: '', redirectTo: 'play', pathMatch: 'full'},
    {path: 'play', component: EmptyComponent},
    {path: 'leaderboard', component: LeaderboardComponent},
    {path: 'chat-rooms', component: ChatRoomsComponent},
    {path: 'profile', loadChildren: () => import('src/app/profile/profile.module').then(m => m.ProfileModule)},
    {path: 'edit', component: EmptyComponent},
    {path: 'settings', component: AccountSettingsComponent},
    {path: '**', component: NotFoundComponent}
    ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

