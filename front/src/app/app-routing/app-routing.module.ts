import { NgModule } from '@angular/core';

import {RouterModule, Routes} from "@angular/router";
import {EmptyComponent} from "../empty/empty.component";
import {NotFoundComponent} from "../not-found/not-found.component";
import {AuthGuard} from "../login/auth.guard";

const routes: Routes = [
  {path: '', canActivate: [AuthGuard], children: [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: EmptyComponent},
    {path: 'play', component: EmptyComponent},
    {path: 'leaderboard', component: EmptyComponent},
    {path: 'chat-rooms', component: EmptyComponent},
    {path: '', loadChildren: () => import('src/app/profile/profile.module').then(m => m.ProfileModule)},
    {path: 'edit', component: EmptyComponent},
    {path: 'settings', component: EmptyComponent},
    {path: '**', component: NotFoundComponent}
    ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
