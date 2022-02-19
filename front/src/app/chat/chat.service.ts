import {Injectable} from "@angular/core";
import {OAuthService} from "../login/oauth.service";
import {User} from "../shared/user";
import {Message} from "./shared/message.model";
import {Chat} from "./shared/chat.model";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {NgbDropdown} from "@ng-bootstrap/ng-bootstrap";
import {Socket} from "ngx-socket-io";
import {MainSocket} from "../socket/MainSocket";

type ChannelType = 'public' | 'protected' | 'private';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public _currChat?: Chat;
  public chats: Map<string, Chat>;
  public dropdown: NgbDropdown;
  public settings = false;

  constructor(private oauthService: OAuthService, private http: HttpClient, private socket: MainSocket) {
    this.chats = new Map();
    this.oauthService.user$.subscribe({
      next: value => {
        if (value) {
          console.log('Chat Service');
          socket.on('message', this.receiveMessage);
          this.fetchRooms();
        }
      }
    })
  }

  joinChannel(roomID: string, password: string, callback: Function) {
    console.log(password);
    this.socket.emit('join', {
        roomID: roomID,
        password: password
      },  (room: any) => {
        if (!room?.error) {
          this.chats.set(room.roomID, room);
          this.loadMessages(room);
          this.openChat(room.roomID);
        }
        callback(room);
      }
    );
  }

  openConversation(user: User) {
    let roomID = this.isChatExists(user);
    if (roomID) {
      this.currChat = this.chats.get(roomID) as Chat;
    } else {
      this.http.post<Chat>(`${environment.apiBaseUrl}/chat/
    conversation`, {
        user: user.uid
      }).subscribe(
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
      // before ? {
        // params: {
        //   before: new Date(chat.messages[0].timestamp).getTime()
        // }
      // } : {}
      );
    obs.subscribe({
      next: value => {
        // if (before) {
        //   chat.messages.unshift(...value);
        // } else {
          chat.messages = value
        // }
      }
    });
    return obs;
  }

  set currChat(value) {
    this._currChat = value;
    this.settings = false;
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
          this.currChat.unread = 0;
        }
      });
    } else {
      this.currChat = chat;
      this.currChat.unread = 0;
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
      this.socket.emit('message', JSON.stringify(m));
    } else {
      console.log('sendMessage(): there is no chat opened');
    }
  }

  receiveMessage = (message: Message) => {
    console.log('receiveMessage:')
    console.log(message);
    let m: Message = message;
    m.timestamp = new Date(m.timestamp);

    let chat = this.chats.get(m.roomID);
    if (chat) {
      chat.messages.push(m);
        console.log('yo')
      if (this.currChat?.roomID != chat.roomID) {
        if (!chat.unread) {
          chat.unread = 0;
        }
        chat.unread++;
      }
    }
  }

  closeChat() {
    this.currChat = undefined;
  }

  fetchRooms() {
    console.log(this.oauthService.user);

    this.http.get<Chat[]>(`${environment.apiBaseUrl}/chat/fetch-rooms`).subscribe({
      next: chats => {
        chats.forEach(value => {
          let chat: Chat = {
            roomID: value.roomID,
            name: value.name,
            isChannel: value.isChannel,
            messages: [],
            unread: 0,
            channelType: value.channelType,
          }

          this.chats.set(chat.roomID, chat);
        })
        console.log(this.chats);
      }
    });
  }

  acceptDuel(sender: User) {

  }

  acceptInvite(roomInvite: {roomID: string; name: string} | undefined) {

  }

  sendInvite(value: { nickname: string }) {

  }

}
