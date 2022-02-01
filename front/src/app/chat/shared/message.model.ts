import {User} from "../../shared/user";

export interface Message {
  roomID: string,
  sender: string,
  message: string,
  timestamp: Date;
}
