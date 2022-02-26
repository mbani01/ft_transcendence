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
import { number } from "@hapi/joi";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _usersRepo: Repository<User>,
    @InjectRepository(Relation) public readonly _relationsRepo: Repository<Relation>,
    private cloudinary : CloudinaryService,
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
    if (points < 10)
      return 'Beginner';
    else if (points >= 10 && points < 20)
      return 'Novice';
    else if (points >= 20 && points < 30)
      return 'Graduate';
    else if (points >= 30 && points < 40)
      return 'Expert';
    else if (points >= 40 && points < 50)
      return 'Master';
    else if (points >= 50 && points < 60)
      return 'Grand Master';
    return 'Legend';
  }

  async saveScore(userId: number, winPoints: number, losePoints, isWinner: boolean)
  {
    const points: number = isWinner && 3 || 0;
    const Calculatedscore: number = points + (Math.abs(winPoints - losePoints) * 0.2);
    const oldScore = (await this._usersRepo.findOne(userId)).score;
    const newScore: any = oldScore + Calculatedscore;
    const scoreAsString = String(newScore)
    console.log("New Score " , newScore);
    await this._usersRepo.createQueryBuilder()
            .update(User)
            .set({ score: scoreAsString , rank: this.getUserRank(newScore)})
            .where("id = :id", { id: userId })
            .execute();
  }

  async getLeaderBoard()
  {
    return  await this._relationsRepo.query("Select * from \"Users\" ORDER BY score DESC;")
  }

  async findBasicInfoById(userId)
  {
    return await this._usersRepo.query("Select id as uid , username as name, avatar as img from \"Users\" where id=$1;", [userId]);
  }

  async uploadAvatar(imgBase64)
  {
    try {
      const image = await this.cloudinary.uploadFile(imgBase64);
      return image.secure_url || image;
    } catch (error) {
      return error
    }
  }
}