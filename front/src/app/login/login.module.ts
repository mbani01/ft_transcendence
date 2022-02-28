import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoginComponent} from "./component/login.component";
import {LeetLogoComponent} from "../shared/leet-logo/leet-logo.component";
import {FortyTwoLogoComponent} from "../shared/forty-two-logo/forty-two-logo.component";
import {RoutingModule} from "./routing.module";
import {HttpClientModule} from "@angular/common/http";
import {TwoFactorAuthComponent} from "./two-factor-auth/two-factor-auth.component";
import {FormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    LoginComponent,
    LeetLogoComponent,
    FortyTwoLogoComponent,
    TwoFactorAuthComponent
  ],
  imports: [
    CommonModule,
    RoutingModule,
    HttpClientModule,
    FormsModule
  ],
  exports: [LeetLogoComponent]
})
export class LoginModule { }
