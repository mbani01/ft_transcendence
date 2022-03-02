import {NgModule} from "@angular/core";
import {AccountSettingsComponent} from "./account-settings.component";
import {AccountTabComponent} from "./account/account-tab.component";
import {NgbNavModule, NgbPopoverModule, NgbProgressbarModule, NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {FriendsComponent} from "./friends/friends.component";
import {ChatModule} from "../chat/chat.module";
import {BlockComponent} from "./blocks/block.component";
import {RouterModule} from "@angular/router";
import {ProfileModule} from "../profile/profile.module";
import {AccountInfoModalComponent} from "./account/account-info-modal/account-info-modal.component";

@NgModule({
  declarations: [
    AccountSettingsComponent,
    AccountTabComponent,
    FriendsComponent,
    BlockComponent,
    AccountInfoModalComponent
  ],
  imports: [
    CommonModule,
    NgbNavModule,
    FormsModule,
    NgbTooltipModule,
    NgbPopoverModule,
    ChatModule,
    NgbProgressbarModule,
    RouterModule,
    ProfileModule
  ],
  exports: [AccountSettingsComponent]
})
export class AccountSettingsModule {

}
