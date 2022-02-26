import {User} from "../../shared/user";

export interface MatchHistory {
  id: string,
  winner: number,
  firstPlayerScore: number,
  secondPlayerScore: number,
  firstPlayer: User,
  secondPlayer: User,
  isDefault: boolean,
  created_at: Date,
}

