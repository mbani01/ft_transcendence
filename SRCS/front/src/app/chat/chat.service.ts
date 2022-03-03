import {EventEmitter, Injectable} from "@angular/core";
import {OAuthService} from "../login/oauth.service";
import {User} from "../shared/user";
import {Message} from "./shared/message.model";
import {Chat} from "./shared/chat.model";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {NgbDropdown} from "@ng-bootstrap/ng-bootstrap";
import {MainSocket} from "../socket/MainSocket";
import {firstValueFrom, Observer} from "rxjs";
import {NotifierService} from "angular-notifier";

type ChannelType = 'public' | 'protected' | 'private';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private _currChat?: Chat;
  public role?: string;
  public chats: Map<string, Chat>;
  public dropdown: NgbDropdown;
  private _settings = false;
  public onReceiveMessage = new EventEmitter<Chat>();

  constructor(private oauthService: OAuthService, private http: HttpClient, private socket: MainSocket,
              private notifierService: NotifierService) {
    this.chats = new Map();
    this.oauthService.user$.subscribe({
      next: value => {
        if (value) {
          socket.on('chat-message', this.receiveMessage);
          socket.on('newDirectMessage', this.newDirectMessage.bind(this));
          this.fetchRooms();
        }
      }
    })
  }

  joinChannel(roomID: string, password: string, callback: Function) {
    this.socket.emit('join', {
        roomID: roomID,
        password: password
      },  (room: any) => {
        if (!room?.error) {
          room.messages = [];
          // this.loadMessages(room);
          this.chats.set(roomID, room);
          this.openChat(roomID);
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
      this.socket.emit('chat-conversation', {
        otherUser: user.uid
      }, (chat: Chat & {error: string}) => {
        if (!chat.error) {
          chat.messages = [];
          this.currChat = chat;
          this.newDirectMessage(chat);
        }
      })
    }
  }

  newDirectMessage(chat: Chat) {
    chat.messages = [];
    this.chats.set(chat.roomID, chat);
  }

  loadMessages(chat: Chat, obs: Partial<Observer<any>>) {
    this.http.get<Message[]>(`${environment.apiBaseUrl}/chat/messages/${chat.roomID}`).subscribe({
      next: value => {
        chat.messages = value
        obs.next?.(value);
      }
    });
  }

  set settings(settings: boolean) {
    this._settings = settings;
    if (!settings) {
      this.socket.removeListener('ban');
      this.socket.removeListener('unban');
      this.socket.removeListener('mute');
      this.socket.removeListener('unmute');
    }
  }

  get settings() {
    return this._settings;
  }

  set currChat(value) {
    this._currChat = value;
    this.settings = false;
    if (this._currChat) {
      this.getRole(this._currChat.roomID, this.oauthService.user.uid).then(value => {
        this.role = value;
      });
    } else {
      this.role = undefined;
    }
    // this.showChat();
    // if (value?.messages.length === 0) {
    // this.loadMessages(value);
    // }
  }

  get currChat() {
    return this._currChat;
  }

  leaveChannel(roomID = this.currChat?.roomID) {
    if (roomID) {
      this.socket.emit('chat-leave', {
        roomID: roomID
      }, (data: any) => {
        if (data.error) {
          this.notifierService.notify('error', data.error);
        } else if (data.roomID) {
          if (this.currChat?.roomID == data.roomID) {
            this.currChat = undefined;
          }
          this.chats.delete(data.roomID);
          this.notifierService.notify('success', `you left the channel`);
        }
      });
    }

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

  sendMessage(message: string, callback?: any) {
    if (this.currChat) {
      let m: Message = {
        roomID: this.currChat.roomID,
        sender: this.oauthService.user,
        message: message,
        timestamp: new Date()
      };
      this.socket.emit('chat-message', JSON.stringify(m), callback);
    } else {
    }
  }

  receiveMessage = (message: Message) => {
    let m: Message = message;
    m.timestamp = new Date(m.timestamp);

    let chat = this.chats.get(m.roomID);
    if (chat) {
      chat.messages.push(m);
      if (this.currChat?.roomID != chat.roomID) {
        if (!chat.unread) {
          chat.unread = 0;
        }
        chat.unread++;
      }
      this.onReceiveMessage.emit(chat);
    }
  }

  closeChat() {
    this.currChat = undefined;
  }

  fetchRooms() {

    this.http.get<any>(`${environment.apiBaseUrl}/chat/fetch-rooms`).subscribe({
      next: chats => {
        chats.forEach((value: any) => {
          let chat: Chat = {
            roomID: value.roomID,
            name: value.name,
            isChannel: value.isChannel,
            messages: [],
            unread: 0,
            owner: value.owner,
            type: value.channelType,
            users: value.users
          }
          this.chats.set(chat.roomID, chat);
        })
      }
    });
  }

  acceptDuel(sender: User) {

  }

  acceptInvite(roomInvite: {roomID: string; name: string} | undefined) {

  }

  sendInvite(value: { nickname: string }, callback: any) {
    this.socket.emit('chat-room-invite', {
      name: value.nickname,
      roomID: this.currChat?.roomID
    }, callback);
  }

  async getRole(roomID: string, userID: number) {
    let role = await firstValueFrom(this.http.get<{ role: string }>(
      `${environment.apiBaseUrl}/chat/${roomID}/role/${userID}`));
    return role.role;
  }

}
