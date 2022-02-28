import {Component, EventEmitter, Input, Output} from "@angular/core";
import {Message} from "../../shared/message.model";
import {ChatService} from "../../chat.service";
import {OAuthService} from "../../../login/oauth.service";
import {NgbPopoverConfig} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  @Input() prev: Message | undefined;
  @Input() message: Message;
  @Input() next?: Message;
  @Output('deleteInvite') deleteInvite = new EventEmitter();
  // @Input() showAvatar: boolean = false;

  constructor(private oAuthService: OAuthService, private popover: NgbPopoverConfig, public chatService: ChatService) {
    popover.popoverClass = 'popover-dark';
  }

  ngOnInit() {
  }
  showAvatar() {
    return !(this.next && this.next.sender.uid == this.message.sender.uid);

  }

  isMine() {
    if (this.oAuthService.user.uid === this.message.sender.uid) {
      return 'mine';
    }
    return '';
  }

  borderRadius() {
    let border = {
      "border-bottom-left-radius": "18px", "border-bottom-right-radius": "18px",
      "border-top-left-radius": "18px", "border-top-right-radius": "18px"
    };
    if (this.message.sender == this.next?.sender) {
      if (this.oAuthService.user.uid === this.message.sender.uid) {
        border["border-bottom-right-radius"] = "5px";
      } else {
        border["border-bottom-left-radius"] = "5px";
      }
    }
    if (this.message.sender == this.prev?.sender) {
      if (this.oAuthService.user.uid === this.message.sender.uid) {
        border["border-top-right-radius"] = "5px";
      } else {
        border["border-top-left-radius"] = "5px";
      }
    }
    return border;
  }
  //
  // borderTop() {
  //   if (this.message.sender == this.next?.sender) {
  //     return 'border-bottom';
  //   }
  //   return '';
  // }
  //
  // borderBottom() {
  //   if (this.message.sender == this.prev?.sender) {
  //     return 'border-top';
  //   }
  //   return '';
  // }

  marginBottom() {
    if (this.message.sender.uid !== this.next?.sender.uid) {
      return 'mb-2';
    }
    return '';
  }

  acceptDuel() {
    this.chatService.acceptDuel(this.message.sender);
    this.deleteInvite.emit();
  }

  rejectDuel() {
    this.deleteInvite.emit();
  }

  acceptInvite() {
    this.chatService.acceptInvite(this.message.roomInvite);
    this.deleteInvite.emit();
  }

  rejectInvite() {
    this.deleteInvite.emit();
  }
}
