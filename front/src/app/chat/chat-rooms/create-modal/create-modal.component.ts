import {Component, EventEmitter, Input, Output} from "@angular/core";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {OAuthService} from "../../../login/oauth.service";
import {NgForm} from "@angular/forms";
import {Socket} from "ngx-socket-io";
import {ChatService} from "../../chat.service";
import {MainSocket} from "../../../socket/MainSocket";
import {Chat} from "../../shared/chat.model";
import {NotifierService} from "angular-notifier";

@Component({
  selector: 'create-modal',
  templateUrl: 'create-modal.component.html',
  styleUrls: ['create-modal.component.scss']
})
export class CreateModalComponent {
  @Input() modal: NgbActiveModal;
  @Input() room: Chat;
  @Output() createModal = new EventEmitter<Chat>();

  isPublic: boolean = false;

  constructor(private ngbModal:NgbModal, private http: HttpClient, private oauthService: OAuthService,
              private socket: MainSocket, private chatService: ChatService, private notifierService: NotifierService) {
  }

  ngOnInit() {
  }

  createRoom(createRoom: NgForm) {
    if (createRoom.value.isPublic && createRoom.value.password?.length === 0) {
      delete createRoom.value.password;
    }
    this.socket.emit('create-channel', createRoom.value, (value: any) => {
      if (!value.error) {
        this.createModal.emit(value);
        this.modal.close();
        this.notifierService.notify('success', `Channel has been created`);
      } else {
        createRoom.form.setErrors(value);
      }
    });
    // this.http.post<Chat>(`${environment.apiBaseUrl}/chat/create-channel`, createRoom.value).subscribe();
  }

}
