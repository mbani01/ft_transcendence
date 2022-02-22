import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { Relation } from "./entity/relation.entity";
import { User } from "./entity/user.entity";
import { ICreateRelation, IDeleteRelation, IUpdateRelation } from "./interfaces/create-relation.interface";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _usersRepo: Repository<User>,
    @InjectRepository(Relation) private readonly _relationsRepo: Repository<Relation>,
  ) { }

  async create(userDto: CreateUserDto): Promise<User> {
    const user = this._usersRepo.create(userDto);
    return await this._usersRepo.save(user);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, like } = paginationQuery;
    return this._usersRepo.find();
  }

  async findById(userId: number): Promise<User> {
    return await this._usersRepo.findOne({ id: userId });
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
    if (relation.length) throw new UnauthorizedException('relation already exist');
    const newRelation = this._relationsRepo.create(createRelation);
    return await this._relationsRepo.save(newRelation);
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
        userFirst: user
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
        isFriends: true,
        blocker: null
      }
    });
    if (relation.length === 0) throw new NotFoundException('you can\'t block this user');
    await this._relationsRepo.update(relation[0].id, {
      blocker: curUser,
      isFriends: false
    })
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
}