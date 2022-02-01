import {Component} from "@angular/core";
import {ChatService} from "../chat.service";
import {Chat} from "../shared/chat.model";

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent {
  constructor(private chatService: ChatService) {

  }
  ngOnInit() {
  }
  get chats() {
    // console.log(this.chatService.chats.values());
    return this.chatService.chats;
  }

  get chatSize() {
    return this.chatService.chats.size;
  }

  openChat(roomID: string) {
    console.log(roomID);
    this.chatService.openChat(roomID);
  }
}
