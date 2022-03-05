import {Component, ElementRef, ViewChild} from "@angular/core";
import {ChatService} from "../chat.service";
import {Message} from "../shared/message.model";
import {NgForm} from "@angular/forms";
import {User} from "../../shared/user";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {NotifierService} from "angular-notifier";

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

  @ViewChild('t') tooltip: NgbTooltip;

  // private isAllMessage = false;
  // settings = false;

  constructor(public chatService: ChatService, private notifierService: NotifierService) {
    this.chatService.onReceiveMessage.subscribe((chat) => {
      if (chat && this.chat && chat.roomID === this.chat.roomID) {
        setTimeout(this.scrollDown.bind(this))
      }
    });
    if (this.chatService.currChat?.messages.length == 0 && this.chatService.currChat.roomID != '0') {
      this.loading = true;
      this.chatService.loadMessages(this.chatService.currChat, {
        next: () => {
          this.loading = false;
          setTimeout(this.scrollDown.bind(this));
        }
      });
    }
  }

  ngOnInit() {
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
    if (this.content && this.content.nativeElement) {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    }
  }

  get chat() {
    return this.chatService.currChat!;
  }
  get messages() {
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
    if (form.value.message) {
<<<<<<< HEAD:SRCS/front/src/app/chat/chatting/chatting.component.ts
      form.value.message = form.value.message.trimStart();
      form.value.message = form.value.message.trimEnd();
=======
      form.value.message = form.value.message.trim();
>>>>>>> main:front/src/app/chat/chatting/chatting.component.ts
      if (form.value.message !== '') {
        this.chatService.sendMessage(form.value.message, (err: {error: string}) => {
          if (err.error) {
            this.notifierService.notify('error', err.error);
            form.controls['message'].setErrors(err)
            this.tooltip.open();
          }
        });
        form.reset();
      }
    }
  }

  deleteInvite(i: number) {
    this.chatService.currChat!.messages.splice(i, 1);
  }

  getUser() {
    return this.chatService.currChat?.users as User;
  }
}
