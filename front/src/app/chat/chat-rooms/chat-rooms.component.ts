import {Component, TemplateRef, ViewChild} from "@angular/core";
import {ChatRoom, ChatType} from "../shared/chat-room.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {JoinModalComponent} from "./join-modal/join-modal.component";
import {ChatService} from "../chat.service";
import {Chat} from "../shared/chat.model";

@Component({
  selector: 'chat-rooms',
  templateUrl: 'chat-rooms.component.html',
  styleUrls: ['chat-rooms.component.scss']
})
export class ChatRoomsComponent {
  chats: ChatRoom[];
  chatType = ChatType;
  selectedChat: ChatRoom;

  @ViewChild('content') content: TemplateRef<any>;

  constructor(private http: HttpClient, private ngbModal: NgbModal, private chatService: ChatService) {
    http.get<ChatRoom[]>(`${environment.apiBaseUrl}chat/channel`).subscribe(
      {
        next: value => {
          console.log(value);
          this.chats = value;
        }
      }
    );
  }

  openPasswordModal(chat: ChatRoom) {
    this.ngbModal.open(this.content, {centered: true});
    this.selectedChat = chat;
  }

  joinModalEvent(joinModal: JoinModalComponent) {
    joinModal.room = this.selectedChat;
  }

  joinChannel(chat: ChatRoom) {
    if (chat.type == ChatType.PROTECTED) {
      this.openPasswordModal(chat);
    } else {
      this.chatService.joinChannel(chat.roomID!, '', (room: Chat) => {
        console.log(room);
        this.chatService.chats.set(room.roomID, room);
        this.chatService.openChat(room.roomID);
      });
    }
  }
}
