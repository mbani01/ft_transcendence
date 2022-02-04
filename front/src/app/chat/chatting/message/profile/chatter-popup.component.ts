import {Component, Input} from "@angular/core";
import {User} from "../../../../shared/user";

@Component({
  selector: 'chatter-popup',
  templateUrl: 'chatter-popup.component.html',
  styleUrls: ['chatter-popup.component.scss']
})
export class ChatterPopupComponent {
  @Input() user: User;
  muteTime = {hour: 1, minute: 0};

}
