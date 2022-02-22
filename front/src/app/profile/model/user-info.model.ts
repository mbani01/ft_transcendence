
type STATUS = 'on-line' | 'off-line' | 'in-game'

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
}

