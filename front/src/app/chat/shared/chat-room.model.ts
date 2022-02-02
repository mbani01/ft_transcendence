import {User} from "../../shared/user";
import {Message} from "./message.model";

export class ChatRoom {
  private users: User[] = [];
  private messages: Message[] = [];
  private unread: number = 0;
}
