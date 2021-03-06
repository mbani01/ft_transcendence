export interface UserInfo {
  id: number;
  username: string;
  avatar?: string;
  gamesCount?: number;
  gamesWon?: number;
  is2FAEnabled?: boolean;
  twoFASecret?: string;
}
