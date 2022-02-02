import {Component, Input, OnInit} from '@angular/core';
import {UserInfo} from "../model/user-info.model";
import {User} from "../../shared/user";

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  @Input() user: User;
  @Input() userInfo: UserInfo;
  constructor() { }

  ngOnInit(): void {
  }

}
