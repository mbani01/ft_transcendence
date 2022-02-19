import {User} from "../../shared/user";

export type ChatType = 'public' | 'private' | 'protected';
export interface ChatRoom {
  roomID?: string,
  name?: string
  isChannel?: boolean,
  type?: ChatType,
  owner?: User
}
