import {Component} from "@angular/core";
import {ChatService} from "../chat.service";

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
    this.chatService.openChat(roomID);
  }
}
