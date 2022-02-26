import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { join } from "path";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OutUserInfoDto } from "./dto/out-user-info.dto";
import { OutUserDto } from "./dto/out-user.dto";
import { UpdateUserNameDto } from "./dto/update-body.dto";
import { UsersService } from "./users.service";
import * as fs from 'fs';
import { Clients } from "../../adapters/socket.adapter";
import { User } from "./entity/user.entity";
import { IStats } from "./interfaces/stats.interface";
import { array } from "@hapi/joi";

@Controller("users")
export class UsersController {
  constructor(private readonly _usersService: UsersService) { }

  @Get()
  async getAll(@Query() paginationQuery: any) {
    return await this._usersService.findAll(paginationQuery);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@Query("id") userID: number)
  {
    return Clients.getUserStatus(userID);
  }


  @Post('/update_nickname')
  @UseGuards(JwtAuthGuard)
  async updateUserName(@Body('nickname') newUserName: string, @Req() req) {
    try {
      const res = await this._usersService.updateUserName(req.user.id, newUserName);
      console.log("updated user: ", res);
    } catch (e) {
      throw new UnauthorizedException('nickname already taken');
    }
  }


  @Post('/upload_avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(@UploadedFile() file: any, @Req() req, @Res() res) {
    // console.log(__dirname)
    // const f = fs.writeFile(`/Users/mosan/Documents/last/back/src/assets/avatars/${req.user.id}`, file.buffer, { flag: 'w+' });
    const fullPath = `${__dirname}/../../../src/`;
    const avatarPath = `assets/avatars/${req.user.id}`;
    const path = fullPath + avatarPath;

    try {
      fs.writeFileSync(path, file.buffer, { flag: 'w+' });
    } catch (e) {
      console.log(e);
    }
    const user = await this._usersService.updateAvatar(req.user.id, avatarPath);
    res.send({avatar: user.avatar});
  }

  /*
  returns an object with the following properties:
    {
      "games": number,
      "wins": number,
      "rankPoints": number,
      "totalScore": number
    }
  */
  @UseGuards(JwtAuthGuard)
  @Get("/user-info/:uid")
  async getUserInfo(@Param("uid") userID: number, @Req() req): Promise<any> {
    /**
     {
        "name": string
        "img": string,
        "status": ONLINE | OFFLINE | IN_GAME,
        "isFriend": boolean,
        "isBlocked": boolean,
        "games": number,
        "wins": number,
        "rank": string,
        "totalScore": number
      }
     */

    const user = req.user
    let relation;
    let isActive;
    let otherUser: User;
    let stats: IStats;
    try {
      otherUser = await this._usersService.findById(userID);
      console.log('Stats: \n', otherUser);
      relation = await this._usersService.getRelation(user, otherUser);
      isActive = Clients.isActiveUser(otherUser.id);

      stats = {
        games: otherUser.gamesAsFirstPlayer.length + otherUser.gamesAsSecondPlayer.length,
        wins: otherUser.wins.length,
        totalScore: otherUser.score,
        rankPoints: otherUser.rank,
      };
    }
    catch (e) {
      return { error: e.message };
    }

    let Games = []
    Games = Games.concat(otherUser.gamesAsFirstPlayer, otherUser.gamesAsSecondPlayer);
    for(let i of Games)
    {
      i.firstPlayer = (await this._usersService.findBasicInfoById(i.firstPlayer))[0];
      i.secondPlayer = (await this._usersService.findBasicInfoById(i.secondPlayer))[0];
    }
    if (relation && relation.length === 0)
      return { ...stats, status: (isActive) ? 'on-line' : 'off-line', img: user.img, name: user.username, isFriend: false, isBlocked: false, Games };
    return { ...stats, status: (isActive) ? 'on-line' : 'off-line', img: user.img, name: user.username, isFriend: relation[0].isFriends, isBlocked: (relation[0].blocker !== null), Games };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add_friend')
  async addFriend(@Body('userID') otherUserId: number, @Req() req: any) {
    try {
      const user = req.user;
      const otherUser = await this._usersService.findById(otherUserId);
      const friend = await this._usersService.createRelation({ userFirst: user, userSecond: otherUser, requester: user, blocker: null, isFriends: true });
      console.log(friend);
    } catch (e) {
      return { error: e.message };
    }
    return { userID: otherUserId };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/remove_friend')
  async removeFriend(@Body('userID') otherUserId: number, @Req() req: any) {
    try {
      const user = req.user;
      const otherUser = await this._usersService.findById(otherUserId);
      await this._usersService.removeRelation({ userFirst: user, userSecond: otherUser, requester: user });
    } catch (e) {
      return { error: e.message };
    }
    return { userID: otherUserId };
  }



  @UseGuards(JwtAuthGuard)
  @Get('/friends')
  async getFriend(@Req() req: any) {
    try {
      const user = req.user;
      return await this._usersService.getFriends(user);
    } catch (e) {
      return { error: e.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/block')
  async blockUser(@Body('userID') userID: number, @Req() req: any) {
    try {
      const otherUser = await this._usersService.findById(userID);
      await this._usersService.blockUser(req.user, otherUser);
    }
    catch (e) {
      return { error: e.message };
    }
    return { userID };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/unblock')
  async unblockUser(@Body('userID') userID: number, @Req() req: any) {
    try {
      const otherUser = await this._usersService.findById(userID);
      await this._usersService.unblockUser(req.user, otherUser);
    }
    catch (e) {
      return { error: e.message };
    }
    return { userID };
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getOne(@Param("id") userId: number, @Req() req): Promise<OutUserDto> {
    if (typeof userId == "number") {
      const user = await this._usersService.findById(userId);
      return { uid: user.id, name: user.username, img: user.avatar};
    }
    const user = await this._usersService.findByUserName(req.user.username);
    return { uid: user.id, name: user.username, img: user.avatar };
  }

}
