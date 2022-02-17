import {User} from "../../shared/user";

export enum ChatType {
  PRIVATE,
  PUBLIC,
  PROTECTED
}
export interface ChatRoom {
  roomID?: string,
  name?: string
  isChannel?: boolean,
  type?: ChatType,
  owner?: User
}
