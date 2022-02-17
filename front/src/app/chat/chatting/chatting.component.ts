import {Component, ElementRef, ViewChild} from "@angular/core";
import {ChatService} from "../chat.service";
import {Message} from "../shared/message.model";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-chatting',
  templateUrl: './chatting.component.html',
  styleUrls: ['./chatting.component.scss']
})
export class ChattingComponent {

  @ViewChild('content') content: ElementRef;
  // @ViewChild('messageTemplate') messageTemplate: TemplateRef<NgIfContext<boolean>>;
  readonly maxMsToShowDate: number = 60 * 60 * 1000; // 1 hour

  loading = false;

  private isAllMessage = false;
  // settings = false;

  constructor(public chatService: ChatService) {
    console.log('h1');
    if (this.chatService.currChat?.messages.length == 0 && this.chatService.currChat.roomID != '0') {
      this.loading = true;
      this.chatService.loadMessages(this.chatService.currChat).subscribe({
        next: chats => {
          if (chats.length < 30) {
            this.isAllMessage = true;
          }
          this.loading = false;
          this.scrollDown();
        }
      });
    }
  }

  ngOnInit() {
    console.log('h2');
  }
  ngAfterViewInit(): void {
    this.content.nativeElement.onscroll = (scroll: any) => {
      console.log('SCROLL ' + scroll.target.scrollTop);
      if (scroll.target.scrollTop == 0 && !this.isAllMessage && this.chatService.currChat) {
        this.loading = true;
        let topMessage = this.chatService.currChat.messages[0];
        this.chatService.loadMessages(this.chatService.currChat, true).subscribe({
          next: (chats) => {
            this.loading = false
            if (chats.length < 30) {
              this.isAllMessage = true;
            }
          }});

      }
    }

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
    console.log('YO ' + this.content.nativeElement.scrollTop);
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
    if (this.chatService.settings) {
      this.chatService.settings = false;
    } else {
      this.chatService.closeChat();
    }
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

  // onScroll($event: Event) {
  //   console.log($event);
  // }
  deleteInvite(i: number) {
    this.chatService.currChat!.messages.splice(i, 1);
  }
}
