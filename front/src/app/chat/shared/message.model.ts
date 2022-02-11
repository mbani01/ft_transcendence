import {User} from "../../shared/user";

export interface Message {
  roomID: string,
  sender: User,
  message: string,
  duel?: string,
  roomInvite?: { roomID: string, name: string },
  timestamp: Date;
}
