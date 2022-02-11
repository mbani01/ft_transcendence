import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import {AppRoutingModule} from "./app-routing/app-routing.module";
import { EmptyComponent } from './empty/empty.component';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import { NotFoundComponent } from './not-found/not-found.component';
import {LoginModule} from "./login/login.module";
import {AuthInterceptor} from "./login/auth.interceptor";
import {ChatModule} from "./chat/chat.module";
import {LeaderboardComponent} from "./leaderboard/leaderboard.component";
import {NgbNavModule, NgbPopoverModule, NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {AccountSettingsComponent} from "./account-settings/account-settings.component";
import {FormsModule} from "@angular/forms";
import {AccountSettingsModule} from "./account-settings/account-settings.module";

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    EmptyComponent,
    NotFoundComponent,
    LeaderboardComponent,
  ],
  imports: [
    BrowserModule,
    LoginModule,
    ChatModule,
    AppRoutingModule,
    NgbPopoverModule,
    AccountSettingsModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
