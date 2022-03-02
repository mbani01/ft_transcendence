export type STATUS = 'online' | 'offline' | 'in-game'

export interface User {
  uid: number;
  name: string;
  img: string;
  status?: STATUS;
}
