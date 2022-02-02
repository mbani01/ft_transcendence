import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginComponent} from "./component/login.component";
import {CallbackComponent} from "./callback/callback.component";
import {LeetLogoComponent} from "../shared/leet-logo/leet-logo.component";
import {FortyTwoLogoComponent} from "../shared/forty-two-logo/forty-two-logo.component";
import {RoutingModule} from "./routing.module";
import {HttpClientModule} from "@angular/common/http";



@NgModule({
  declarations: [
    LoginComponent,
    CallbackComponent,
    LeetLogoComponent,
    FortyTwoLogoComponent
  ],
  imports: [
    CommonModule,
    RoutingModule,
    HttpClientModule
  ],
  exports: [LeetLogoComponent]
})
export class LoginModule { }
