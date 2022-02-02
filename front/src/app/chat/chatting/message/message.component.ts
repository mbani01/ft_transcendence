import {Component, Input} from "@angular/core";
import {Message} from "../../shared/message.model";
import {ChatService} from "../../chat.service";
import {OAuthService} from "../../../login/oauth.service";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent {
  @Input() prev: Message | undefined;
  @Input() message: Message;
  @Input() next?: Message;
  // @Input() showAvatar: boolean = false;

  constructor(private oAuthService: OAuthService) {
  }

  showAvatar() {
    return !(this.next && this.next.sender == this.message.sender);

  }

  isMine() {
    if (this.oAuthService.user.name === this.message.sender) {
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
      if (this.oAuthService.user.name === this.message.sender) {
        border["border-bottom-right-radius"] = "0";
      } else {
        border["border-bottom-left-radius"] = "0";
      }
    }
    if (this.message.sender == this.prev?.sender) {
      if (this.oAuthService.user.name === this.message.sender) {
        border["border-top-right-radius"] = "0";
      } else {
        border["border-top-left-radius"] = "0";
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
    if (this.message.sender !== this.next?.sender) {
      return 'mb-2';
    }
    return '';
  }
}
