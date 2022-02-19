import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entity/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _usersRepo: Repository<User>
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

  async update(userId: number, updateUserDto: any) {
    const user = await this._usersRepo.preload({
      id: userId,
      ...updateUserDto,
    });
    if (!user)
      throw new NotFoundException(`user with id #${userId} not found!`);
    return this._usersRepo.save(user);
  }

  async remove(userId: number) {
    const user = await this.findById(userId);
    this._usersRepo.remove(user);
  }

  async enable2FactorAuth(userId: number) {
    const user = await this._usersRepo.update(userId, {
      is2FAEnabled: true,
    });
    console.log("user has enable 2fa");
  }

  async set2FASecret(secret: string, id: number) {
    this._usersRepo.update(id, {
      twoFASecret: secret,
    });
  }

  async unSet2FASecret(userId: number) {
    await this._usersRepo.update(userId, {
      twoFASecret: null,
    });
    console.log('after I set the user secret: ', await this.findById(userId))
  }
}
