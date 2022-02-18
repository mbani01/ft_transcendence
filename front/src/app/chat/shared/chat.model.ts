import {Message} from "./message.model";
import {User} from "../../shared/user";

export interface Chat {
  roomID: string;
  name: string;
  isChannel: boolean;
  users?: User | User[];
  messages: Message[];
  unread: number;
  channelType: 'public' | 'protected' | 'private';
}
