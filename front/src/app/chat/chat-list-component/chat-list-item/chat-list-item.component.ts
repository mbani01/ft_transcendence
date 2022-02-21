import {Component, Input} from "@angular/core";
import {Chat} from "../../shared/chat.model";
import {ChatService} from "../../chat.service";
import {User} from "../../../shared/user";

@Component({
  selector: 'chat-list-item',
  templateUrl: './chat-list-item.component.html',
  styleUrls: ['./chat-list-item.component.scss']
})
export class ChatListItemComponent {
  @Input() public chat: Chat;

  constructor() {
  }
  ngOnInit() {
  }

  getUser() {
    return this.chat.users as User;
  }
}
