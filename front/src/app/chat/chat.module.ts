import {NgModule} from "@angular/core";
import {ChatListComponent} from "./chat-list-component/chat-list.component";
import {ChatListItemComponent} from "./chat-list-component/chat-list-item/chat-list-item.component";
import {CommonModule} from "@angular/common";
import {ChatComponent} from "./chat.component";
import {ChattingComponent} from "./chatting/chatting.component";
import {MessageComponent} from "./chatting/message/message.component";
import {NgbDropdownModule, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import { DateComponent } from './chatting/date/date.component';

@NgModule({
  declarations: [
    ChatListComponent,
    ChatListItemComponent,
    ChatComponent,
    ChattingComponent,
    MessageComponent,
    DateComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    NgbDropdownModule

  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule {}
