import {Component, EventEmitter, Input, Output} from "@angular/core";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {OAuthService} from "../../../login/oauth.service";
import {NgForm} from "@angular/forms";
import {ChatService} from "../../chat.service";
import {MainSocket} from "../../../socket/MainSocket";
import {Chat} from "../../shared/chat.model";
import {NotifierService} from "angular-notifier";

@Component({
  selector: 'join-modal',
  templateUrl: 'join-modal.component.html',
  styleUrls: ['join-modal.component.scss']
})
export class JoinModalComponent {
  @Input() modal: NgbActiveModal;
  @Input() room: Chat;
  @Output() joinModal = new EventEmitter<JoinModalComponent>();

  constructor(private ngbModal:NgbModal, private http: HttpClient, private oauthService: OAuthService,
              private socket: MainSocket, private chatService: ChatService, private notifierService: NotifierService) {
  }

  ngOnInit() {
    this.joinModal.emit(this);
  }

  joinRoom(joinForm: NgForm) {
      this.chatService.joinChannel(this.room.roomID!, joinForm.value.password, (error: { error: string }) => {
        console.log(error);
        if (error?.error) {
          joinForm.form.controls['password'].setErrors(error);
        } else {
          console.log("join success");
          this.notifierService.notify('success', 'You joined the channel');
          this.modal.close();
        }
      })
  }
}
