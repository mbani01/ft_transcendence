import {Component, TemplateRef} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {JoinModalComponent} from "./join-modal/join-modal.component";
import {ChatService} from "../chat.service";
import {Chat} from "../shared/chat.model";
import {NgForm} from "@angular/forms";
import {NotifierService} from "angular-notifier";

@Component({
  selector: 'chat-rooms',
  templateUrl: 'chat-rooms.component.html',
  styleUrls: ['chat-rooms.component.scss']
})
export class ChatRoomsComponent {
  chats: Chat[];
  selectedChat: Chat;

  // @ViewChild('passwordModal') passwordModal: TemplateRef<any>;
  private like: string = '';
  pagination = {
    page: 1,
    collectionSize: 0,
    maxSize: 10,
  }
  page: number = 1;

  constructor(private http: HttpClient, private ngbModal: NgbModal, public chatService: ChatService,
              private notifierService: NotifierService) {
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
      this.chatService.joinChannel(chat.roomID!, '', (value: any) => {
        if (value.error) {
          this.notifierService.notify('error', value.error);
        } else {
          this.notifierService.notify('success', 'You joined the channel');
        }
      });
    }
  }

  openCreateRoom(content: TemplateRef<any>) {
    this.ngbModal.open(content, {centered: true});
  }

  httpGetChannels() {

    let params = new HttpParams().append('page', this.pagination.page);
    if (this.like !== '') {
      params = params.append('like', this.like);
    }
    this.http.get<{channels: Chat[], collectionSize: number}>(`${environment.apiBaseUrl}/chat/channels`, {
      params: params
    }).subscribe(
      {
        next: value => {
          this.chats = value.channels;
          this.pagination.collectionSize = value.collectionSize;
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
