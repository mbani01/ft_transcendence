import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UsersService {
  // This is to change, where you'd build your user model and persistence layer
  // using TypeORM.
  private _users: UserEntity[] = [
    {
      id: 1,
      username: 'john',
      gamesCount: 0,
      gamesWon: 0,
      is2FAEnabled: false,
    },
    {
      id: 1,
      username: 'maria',
      gamesCount: 0,
      gamesWon: 0,
      is2FAEnabled: false,
    },
  ];

  findAll() {
    return this._users;
  }

  async findOne(userId: number): Promise<UserEntity | undefined> {
    return this._users.find((user) => user.id === userId);
  }
}
