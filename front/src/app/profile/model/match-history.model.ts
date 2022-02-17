import {User} from "../../shared/user";

export interface MatchHistory {
  player1: User;
  player2: User;
  score1: number;
  score2: number;
  timestamp: Date;
  gameLength: number;
  gameType: string;
}
