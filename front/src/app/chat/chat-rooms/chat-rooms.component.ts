import {Component, TemplateRef} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {JoinModalComponent} from "./join-modal/join-modal.component";
import {ChatService} from "../chat.service";
import {Chat} from "../shared/chat.model";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'chat-rooms',
  templateUrl: 'chat-rooms.component.html',
  styleUrls: ['chat-rooms.component.scss']
})
export class ChatRoomsComponent {
  chats: Chat[];
  selectedChat: Chat;

  // @ViewChild('passwordModal') passwordModal: TemplateRef<any>;
  private like: string;
  pagination = {
    page: 1,
    collectionSize: 0,
    maxSize: 10,
  }
  page: number = 1;

  constructor(private http: HttpClient, private ngbModal: NgbModal, public chatService: ChatService) {
    this.httpGetChannels();
  }

  openPasswordModal(chat: Chat, content: TemplateRef<any>) {
    this.ngbModal.open(content, {centered: true});
    this.selectedChat = chat;
  }

  joinModalEvent(joinModal: JoinModalComponent) {
    joinModal.room = this.selectedChat;
  }

  joinChannel(chat: Chat, content: TemplateRef<any>) {
    if (chat.type === "protected") {
      this.openPasswordModal(chat, content);
    } else {
      this.chatService.joinChannel(chat.roomID!, '', (room: Chat) => {
        // this.chatService.chats.set(room.roomID, room);
        // this.chatService.openChat(room.roomID);
      });
    }
  }

  openCreateRoom(content: TemplateRef<any>) {
    this.ngbModal.open(content, {centered: true});
  }

  httpGetChannels() {

    this.http.get<{channels: Chat[], collectionSize: number}>(`${environment.apiBaseUrl}/chat/channels`, {
      params: {
        like: this.like,
        page: this.pagination.page
      }
    }).subscribe(
      {
        next: value => {
          this.chats = value.channels;
          this.pagination.collectionSize = value.channels.length;
        }
      }
    );
  }

  searchChannel(searchForm: NgForm) {
    this.like = searchForm.value.like;
    this.httpGetChannels();
  }

  changePage() {
    this.httpGetChannels();
  }

  createModalEvent(chat: Chat) {
    chat.messages = [];
    this.chatService.chats.set(chat.roomID, chat);
    this.httpGetChannels();
  }
}
