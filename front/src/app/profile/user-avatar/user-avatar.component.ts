import {Component, Input} from "@angular/core";
import {User} from "../../shared/user";

@Component({
  selector: 'user-avatar',
  templateUrl: 'user-avatar.component.html',
  styleUrls: ['user-avatar.component.scss']
})
export class UserAvatarComponent {
  @Input() user: User;
  @Input() size = 48;

  getViewBox() {
    return `0 0 ${this.size / 4} ${this.size / 4}`;
  }


}
