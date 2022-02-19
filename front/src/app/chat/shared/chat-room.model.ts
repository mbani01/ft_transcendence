import {User} from "../../shared/user";

export type ChatType = 'private' | 'public' | 'protected';
export interface ChatRoom {
  roomID?: string,
  name?: string
  isChannel?: boolean,
  type?: ChatType,
  owner?: User
}
