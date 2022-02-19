import {Component, EventEmitter, Input, Output} from "@angular/core";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ChatRoom} from "../../shared/chat-room.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {OAuthService} from "../../../login/oauth.service";
import {NgForm} from "@angular/forms";
import {Socket} from "ngx-socket-io";
import {ChatService} from "../../chat.service";
import {MainSocket} from "../../../socket/MainSocket";
import {Chat} from "../../shared/chat.model";

@Component({
  selector: 'create-modal',
  templateUrl: 'create-modal.component.html',
  styleUrls: ['create-modal.component.scss']
})
export class CreateModalComponent {
  @Input() modal: NgbActiveModal;
  @Input() room: ChatRoom;
  @Output() createModal = new EventEmitter<Chat>();

  isPublic: boolean = false;

  constructor(private ngbModal:NgbModal, private http: HttpClient, private oauthService: OAuthService,
              private socket: MainSocket, private chatService: ChatService) {
  }

  ngOnInit() {
    console.log(this.modal);
  }

  createRoom(createRoom: NgForm) {
    console.log(createRoom.value);
    if (createRoom.value.isPublic && createRoom.value.password.length === 0) {
      delete createRoom.value.password;
    }
    this.http.post<Chat>(`${environment.apiBaseUrl}/chat/create-channel`, createRoom.value).subscribe({
      next: value => {
        console.log('next:' + value);
        this.createModal.emit(value);
        this.modal.close();
      },
      error: err => {
        console.log("ERROR creating room");
        console.log(err);
        createRoom.form.setErrors({error: err.error.message[0]});
      }
    });
  }

}
