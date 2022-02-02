import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./component/login.component";
import {CallbackComponent} from "./callback/callback.component";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'login/callback', component: CallbackComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutingModule { }
