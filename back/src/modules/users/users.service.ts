import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { Relation } from "./entity/relation.entity";
import { User } from "./entity/user.entity";
import { ICreateRelation, IDeleteRelation, IUpdateRelation } from "./interfaces/create-relation.interface";
import { ExtractJwt } from "passport-jwt";
import fromAuthHeaderWithScheme = ExtractJwt.fromAuthHeaderWithScheme;
import { Rank } from "./interfaces/stats.interface";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _usersRepo: Repository<User>,
    @InjectRepository(Relation) public readonly _relationsRepo: Repository<Relation>,
  ) { }

  async create(userDto: CreateUserDto): Promise<User> {
    const user = this._usersRepo.create(userDto);
    return await this._usersRepo.save(user);
  }

  async findAll(paginationQuery: any) {
    const { username, limit } = paginationQuery;
    return await this._usersRepo.createQueryBuilder("user")
      .where("user.username like :name", { name: `%${username}%` }).limit(limit).getMany();
  }

  async findById(userId: number): Promise<User> {
    return await this._usersRepo.findOne({ relations: ['wins', 'gamesAsFirstPlayer', 'gamesAsSecondPlayer'], where: { id: userId } });
  }

  async findByUserName(username: string): Promise<User> {
    return await this._usersRepo.findOne({
      where: {
        username: username,
      },
    });
  }

  async updateUserName(userID: number, newUserName: string) {
    const user = await this._usersRepo.preload({
      id: userID,
      username: newUserName
    });
    return await this._usersRepo.save(user);
  }

  async updateAvatar(userID: number, newAvatar: string) {
    const user = await this._usersRepo.preload({
      id: userID,
      avatar: newAvatar
    });
    return await this._usersRepo.save(user);
  }

  async remove(userId: number) {
    const user = await this.findById(userId);
    this._usersRepo.remove(user);
  }

  async enable2FactorAuth(userId: number) {
    await this._usersRepo.update(userId, {
      is2FAEnabled: true,
    });
  }

  async set2FASecret(secret: string, id: number) {
    this._usersRepo.update(id, {
      twoFASecret: secret,
    });
  }

  async unSet2FASecret(userId: number) {
    await this._usersRepo.update(userId, {
      twoFASecret: null,
      is2FAEnabled: false,
    });
    console.log('after I set the user secret: ', await this.findById(userId))
  }


  async createRelation(createRelation: ICreateRelation) {
    const relation = await this._relationsRepo.find({
      where: {
        userFirst: createRelation.userFirst,
        userSecond: createRelation.userSecond,
        requester: createRelation.requester
      }
    });
    if (relation.length) {
      await this._relationsRepo.update(relation[0].id, {
        userFirst: createRelation.userFirst,
        userSecond: createRelation.userSecond,
        requester: createRelation.requester,
        isFriends: createRelation.isFriends,
        blocker: createRelation.blocker
      })
    }
    else {
      const newRelation = this._relationsRepo.create(createRelation);
      return await this._relationsRepo.save(newRelation);
    }
  }


  async updateRelation(updateRelation: IUpdateRelation) {
    const relation = await this._relationsRepo.find({
      where: {
        userFirst: updateRelation.userFirst,
        userSecond: updateRelation.userSecond,
      }
    })
    this._relationsRepo.update(relation[0].id, {
      isFriends: updateRelation.isFriends,
    })
  }

  async removeRelation(relation: IDeleteRelation) {
    const relationToDelete = await this._relationsRepo.find({
      // relations: ['userFirst', 'userSecond', 'requester'],
      where: {
        userFirst: relation.userFirst,
        userSecond: relation.userSecond,
        requester: relation.userFirst,
      }
    })
    console.log(relationToDelete[0]);
    await this._relationsRepo.delete(relationToDelete[0].id);
  }

  async getFriends(user: User) {
    let res = [];
    const friends = await this._relationsRepo.find({
      relations: ['userFirst', 'userSecond'],
      where: {
        userFirst: user,
        isFriends: true
      }
    });
    for (let friend of friends) {
      res.push({
        uid: friend.userSecond.id,
        name: friend.userSecond.username,
        img: friend.userSecond.avatar
      })
    }
    return res;
  }

  async blockUser(curUser: User, otherUser: User) {
    const relation = await this._relationsRepo.find({
      where: {
        userFirst: curUser,
        userSecond: otherUser,
        blocker: null
      }
    });
    if (relation.length !== 0) {
      await this._relationsRepo.update(relation[0].id, {
        blocker: curUser,
        isFriends: false
      })
    }
    else {
      const newRelation = this._relationsRepo.create({
        userFirst: curUser,
        userSecond: otherUser,
        isFriends: false,
        blocker: curUser
      });
      await this._relationsRepo.save(newRelation);
    }
  }

  async unblockUser(curUser: User, otherUser: User) {
    const relation = await this._relationsRepo.find({
      where: {
        userFirst: curUser,
        userSecond: otherUser,
        isFriends: false,
        blocker: curUser
      }
    });
    if (relation.length === 0) throw new NotFoundException('you can\'t unblock this user');
    await this._relationsRepo.update(relation[0].id, {
      blocker: null,
      isFriends: false
    })
  }

  async getRelation(user: User, otherUser: User) {
    return await this._relationsRepo.find({
      relations: ['blocker'],
      where: {
        userFirst: user,
        userSecond: otherUser
      }
    })
  }

  getUserRank(points: number): Rank {
    if (points < 100)
      return 'Beginner';
    else if (points > 100 && points < 200)
      return 'Novice';
    else if (points > 200 && points < 300)
      return 'Graduate';
    else if (points > 300 && points < 400)
      return 'Expert';
    else if (points > 400 && points < 500)
      return 'Master';
    else if (points > 500 && points < 600)
      return ' Grand Master';
    return 'Legend';
  }
}