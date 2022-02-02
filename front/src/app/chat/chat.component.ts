import {Component, OnInit, ViewChild} from "@angular/core";
import {ChatService} from "./chat.service";
import {NgbDropdown} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  public test: string = 'Hello';
  @ViewChild('dropdown') dropdown: NgbDropdown;

  constructor(public chatService: ChatService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.chatService.dropdown = this.dropdown;
  }


  helloClick() {
    this.chatService.showChat();
  }

}
