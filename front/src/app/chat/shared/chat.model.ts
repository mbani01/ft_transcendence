import {Message} from "./message.model";
import {User} from "../../shared/user";

export interface Chat {
  roomID: string;
  name: string;
  isChannel: boolean;
  users?: User | User[];
  messages: Message[];
  unread: number;
  owner?: User;
  type: 'public' | 'protected' | 'private';
}
