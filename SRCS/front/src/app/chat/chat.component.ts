import {Component, OnInit} from "@angular/core";
import {ChatService} from "./chat.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  public test: string = 'Hello';
  // @ViewChild('dropdown') dropdown: NgbDropdown;
  isSettings = false;
  constructor(public chatService: ChatService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // this.chatService.dropdown = this.dropdown;
  }

}
