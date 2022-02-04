import {Component, ElementRef, Input, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {ChatService} from "../chat.service";
import {Chat} from "../shared/chat.model";
import {Message} from "../shared/message.model";
import {NgIfContext} from "@angular/common";
import {NgForm} from "@angular/forms";
import {Observable} from "rxjs";

@Component({
  selector: 'app-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.scss']
})
export class ChattingComponent {

  @ViewChild('content') content: ElementRef;
  @ViewChild('messageTemplate') messageTemplate: TemplateRef<NgIfContext<boolean>>;
  readonly maxMsToShowDate: number = 60 * 60 * 1000; // 1 hour

  loading = false;

  constructor(public chatService: ChatService) {
    if (this.chatService.currChat?.messages.length == 0) {
      this.loading = true;
      this.chatService.loadMessages(this.chatService.currChat).subscribe({
        next: value => {
          this.loading = false;
          this.scrollDown();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.scrollDown();
  }

  isLateMessage(prev: Message, message: Message) {
    if (prev) {
      return new Date(message.timestamp).getTime() > new Date(prev.timestamp).getTime() + this.maxMsToShowDate;
    }
    return false;
  }

  scrollDown() {
    this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
  }

  get chat() {
    return this.chatService.currChat;
  }
  get messages() {
    // console.log("Yo!")
    let msg: Message[] = [];
    if (this.chatService.currChat) {
      msg = this.chatService.currChat.messages;
    }
    return msg;
  }

  back() {
    this.chatService.closeChat();
  }

  sendMessage(form: NgForm) {
    // console.log(form.value);
    if (form.value.message) {
      this.chatService.sendMessage(form.value.message);
      console.log("Help");
      form.reset();
      setTimeout(() => this.scrollDown(), 100);
    }
  }
}
