import {NgModule} from "@angular/core";
import {ChatListComponent} from "./chat-list-component/chat-list.component";
import {ChatListItemComponent} from "./chat-list-component/chat-list-item/chat-list-item.component";
import {CommonModule} from "@angular/common";
import {ChatComponent} from "./chat.component";
import {ChattingComponent} from "./chatting/chatting.component";
import {MessageComponent} from "./chatting/message/message.component";
import {
    NgbDropdownModule, NgbNavModule,
    NgbPaginationModule,
    NgbPopoverModule, NgbTimepickerModule,
    NgbTooltipModule
} from "@ng-bootstrap/ng-bootstrap";
import { DateComponent } from './chatting/date/date.component';
import {ChatRoomsComponent} from "./chat-rooms/chat-rooms.component";
import {JoinModalComponent} from "./chat-rooms/join-modal/join-modal.component";
import {FormsModule} from "@angular/forms";
import {ChatterPopupComponent} from "./chatting/profile/chatter-popup.component";
import {CreateModalComponent} from "./chat-rooms/create-modal/create-modal.component";
import {ChatSettingsComponent} from "./chatting/chat-settings/chat-settings.component";
import {OrderByUnreadPipe} from "./chat-list-component/orderByUnread.pipe";
import {UserAvatarComponent} from "./user-avatar/user-avatar.component";

// const config: SocketIoConfig = {url: environment.chatSocketUri, options: {}}

@NgModule({
  declarations: [
    ChatListComponent,
    ChatListItemComponent,
    ChatComponent,
    ChattingComponent,
    MessageComponent,
    DateComponent,
    ChatRoomsComponent,
    JoinModalComponent,
    CreateModalComponent,
    ChatterPopupComponent,
    ChatSettingsComponent,
    OrderByUnreadPipe,
    UserAvatarComponent
  ],
    imports: [
      CommonModule,
      NgbDropdownModule,
      NgbPopoverModule,
      NgbTooltipModule,
      NgbTimepickerModule,
      NgbPaginationModule,
      FormsModule,
      NgbNavModule
    ],
    exports: [
      ChatComponent,
      ChatterPopupComponent,
      UserAvatarComponent
    ]
})
export class ChatModule {}
