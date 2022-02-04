import {User} from "../../shared/user";

export interface Message {
  roomID: string,
  sender: User,
  message: string,
  timestamp: Date;
}
