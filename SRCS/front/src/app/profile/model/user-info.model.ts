import {MatchHistory} from "./match-history.model";
import {STATUS} from "../../shared/user";


export class UserInfo {
  games: number;

  wins: number;

  rankPoints: number;

  totalScore: number;

  name: string;

  img: string;

  status: STATUS;

  isFriend: boolean;

  isBlocked: boolean;

  Games: MatchHistory[];
}

