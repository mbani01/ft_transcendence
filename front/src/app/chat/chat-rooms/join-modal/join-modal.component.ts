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

@Component({
  selector: 'join-modal',
  templateUrl: 'join-modal.component.html',
  styleUrls: ['join-modal.component.scss']
})
export class JoinModalComponent {
  @Input() modal: NgbActiveModal;
  @Input() room: ChatRoom;
  @Output() joinModal = new EventEmitter<JoinModalComponent>();

  constructor(private ngbModal:NgbModal, private http: HttpClient, private oauthService: OAuthService,
              private socket: MainSocket, private chatService: ChatService) {
  }

  ngOnInit() {
    console.log(this.modal);
    this.joinModal.emit(this);
  }

  joinRoom(joinForm: NgForm) {
    // console.log(joinForm.value.password);

    // this.socket.emit('join', {
    //     roomID: this.room.roomID,
    //     password: joinForm.value.password
    //   }
    // , (error: {error: string}) => {
    //     console.log(error);
    //     if (error.error) {
    //       joinForm.form.controls['password'].setErrors(error);
    //     } else {
    //       this.modal.close('Close click');
    //     }
    //   });
    // if (this.room.roomID) {
      this.chatService.joinChannel(this.room.roomID!, joinForm.value.password, (error: {error: string}) => {
        console.log(error);
        if (error?.error) {
          console.log("error: " + error.error);
          joinForm.form.controls['password'].setErrors(error);
        } else {
          console.log("join success");
          this.modal.close();
        }
      })
    // }

    // this.socket.once('join', (error: {error: string}) => {
    //   console.log(error);
    //   if (error) {
    //     joinForm.form.controls['password'].setErrors(error);
    //   } else {
    //     this.modal.close('Close click');
    //   }
    // });

    // this.http.post(`${environment.apiBaseUrl}/chat/join`,
    //   {
    //     roomID: this.room.roomID,
    //     password: joinForm.value.password
    //   }
    // ).subscribe({
    //   next: value => {
    //     console.log("next: ");
    //     console.log(value);
    //     this.modal.close('Close click');
    //   },
    //   error: (err: {error: {error_name: string}}) => {
    //     console.log("err: ");
    //     console.log(err.error);
    //     // let error: any = {};
    //     // error[err.error.error_name] = true;
    //
    //     joinForm.form.controls['password'].setErrors(err.error);
    //   }
    // });
  }
}
