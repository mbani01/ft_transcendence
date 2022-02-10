import {Injectable} from "@angular/core";
import {OAuthService} from "../login/oauth.service";
import {User} from "../shared/user";
import {Message} from "./shared/message.model";
import {Chat} from "./shared/chat.model";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {NgbDropdown} from "@ng-bootstrap/ng-bootstrap";
import {Socket} from "ngx-socket-io";



@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public _currChat?: Chat;
  public chats: Map<string, Chat>;
  public dropdown: NgbDropdown;

  // private webSocket: WebSocket;
  constructor(private oauthService: OAuthService, private http: HttpClient, private socket: Socket) {
    this.chats = new Map();
    this.oauthService.user$.subscribe({
      next: value => {
        if (value) {
          console.log('Chat Service');
          socket.on('message', this.receiveMessage);
          // socket.fromEvent<string>('message').subscribe({next: this.receiveMessage.bind(this)});

          // this.webSocket = new WebSocket(environment.chatWebSocketUri);
          this.fetchRooms();
          // this.webSocket.addEventListener('open', (event) => {
          //   console.log(event);
          //   this.webSocket.send('Hello this is ft_transcendence');
          //   this.webSocket.addEventListener('message', this.receiveMessage);
          // })
        }
      }
    })
  }

  // showChat() {
  //   this.dropdown.open();
  // }

  joinChannel(roomID: string, password: string, callback: Function) {
    console.log(password);
    this.socket.emit('join', {
        roomID: roomID,
        password: password
      }, (room: any) => {
        if (!room?.error) {
          this.chats.set(room.roomID, room);
          this.loadMessages(room);
          this.openChat(room.roomID);
        }
        callback(room);
      }
    );
    // let chat = this.chats.get(roomID);
    // if (chat !== undefined) {
    //   this.currChat = chat;
    // }
    // this.http.post<Chat>(`${environment.apiBaseUrl}/chat/
    // channel/${roomID}`, this.oauthService.user).subscribe({
    //   next: chat => {
    //     this.chats.set(roomID, chat);
    //     this.currChat = chat;
    //   }
    // });
  }

  openConversation(user: User) {
    let roomID = this.isChatExists(user);
    if (roomID) {
      this.currChat = this.chats.get(roomID) as Chat;
    } else {
      this.http.get<Chat>(`${environment.apiBaseUrl}/chat/
    conversation?participants=${this.oauthService.user.uid},${user.uid}`).subscribe(
        {
          next: chat => {
            this.currChat = chat;
            this.chats.set(chat.roomID, chat);
          }
        }
      );
    }
  }

  loadMessages(chat: Chat, before: boolean = false) {
    let obs = this.http.get<Message[]>(`${environment.apiBaseUrl}/chat/messages/${chat.roomID}`,
      before ? {
        params: {
          before: new Date(chat.messages[0].timestamp).getTime()
        }
      } : {})
    obs.subscribe({
      next: value => {
        if (before) {
          chat.messages.unshift(...value);
        } else {
          chat.messages = value
        }
      }
    });
    return obs;
  }

  set currChat(value) {
    this._currChat = value;
    // this.showChat();
    // if (value?.messages.length === 0) {
      // this.loadMessages(value);
    // }
  }

  get currChat() {
    return this._currChat;
  }


  isChatExists(user: User) {
    let roomID: string | null = null;
    this.chats.forEach((value, key) => {
      if (!value.isChannel) {
        let u = value.users as User;
        if (u.uid == user.uid) {
          roomID = key;
        }
      }
    })
    return roomID;
  }

  openChat(roomID: string) {
    let chat = this.chats.get(roomID);
    if (chat === undefined) {
      this.http.get<Chat>(`${environment.apiBaseUrl}/chat/${roomID}`).subscribe({
        next: (value) => {
          this.chats.set(roomID, value);
          this.currChat = value;
        }
      });
    } else {
      this.currChat = chat;
    }
  }

  sendMessage(message: string) {
    if (this.currChat) {
      let m: Message = {
        roomID: this.currChat.roomID,
        sender: this.oauthService.user,
        message: message,
        timestamp: new Date()
      };
      console.log(m);
      // this.currChat.messages.push(m);
      this.socket.emit('message', JSON.stringify(m));
      // this.webSocket.send(JSON.stringify(m));
    } else {
      console.log('sendMessage(): there is no chat opened');
    }
  }

  receiveMessage = (message: Message) => {
    console.log('receiveMessage:')

    let m: Message = message;
    m.timestamp = new Date(m.timestamp);

    let chat = this.chats.get(m.roomID);
    if (chat) {
      chat.messages.push(m);
    }
  }

  closeChat() {
    this.currChat = undefined;
  }

  fetchRooms() {
    console.log(this.oauthService.user);
    // this.socket.emit('fetch-rooms', (rooms: Chat[]) => {
    //   rooms.forEach(value => {
    //     this.chats.set(value.roomID, value);
    //   })
    //   console.log(this.chats);
    // });
    this.http.get<Chat[]>(`${environment.apiBaseUrl}/chat/fetch-rooms`).subscribe({
      next: chats => {
        chats.forEach(value => {
          this.chats.set(value.roomID, value);
        })
        console.log(this.chats);
      }
    });
  }
}
