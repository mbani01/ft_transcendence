import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { join } from "path";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OutUserInfoDto } from "./dto/out-user-info.dto";
import { OutUserDto } from "./dto/out-user.dto";
import { UpdateUserNameDto } from "./dto/update-body.dto";
import { UsersService } from "./users.service";
import * as fs from 'fs';

@Controller("users")
export class UsersController {
  constructor(private readonly _usersService: UsersService) { }

  @Get()
  async getAll(@Query() paginationQuery: PaginationQueryDto) {
    return await this._usersService.findAll(paginationQuery);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getOne(@Param("id") userId: number | string, @Req() req): Promise<OutUserDto> {
    if (typeof userId == "number") {
      const user = await this._usersService.findById(userId);
      return { uid: user.id, name: user.username, img: user.avatar };
    }
    const user = await this._usersService.findByUserName(req.user.username);
    return { uid: user.id, name: user.username, img: user.avatar };
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
  async updateAvatar(@UploadedFile() file: Express.Multer.File, @Req() req, @Res() res) {
    // console.log(__dirname)
    // const f = fs.writeFile(`/Users/mosan/Documents/last/back/src/assets/avatars/${req.user.id}`, file.buffer, { flag: 'w+' });
    const avatarPath = `/Users/mosan/Documents/last/back/src/assets/avatars/${req.user.id}.png`;
    try {
      fs.writeFileSync(avatarPath, file.buffer, { flag: 'w+' });
    } catch (e) {
      console.log(e);
    }
    const user = await this._usersService.updateAvatar(req.user.id, avatarPath);
    res.send(user.avatar);
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
  async getUserInfo(@Param("uid") userID: number, @Req() req): Promise<OutUserInfoDto> {
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
    const otherUser = await this._usersService.findById(userID);
    return { games: 0, wins: 0, rankPoints: 0, totalScore: 0, status: 'off-line', img: user.img, name: user.username, isFriend: true, isBlocked: false };
  }


}
