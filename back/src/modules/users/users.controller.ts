import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OutUserInfoDto } from "./dto/out-user-info.dto";
import { OutUserDto } from "./dto/out-user.dto";
import { UpdateUserNameDto } from "./dto/update-body.dto";
import { UsersService } from "./users.service";

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
  updateUserName(@Body('name') newUserName: string, @Req() req) {
    try {
      this._usersService.updateUserName(req.user.id, newUserName);
    } catch (e) {
      throw new UnauthorizedException('nickname already taken');
    }
  }

  @Post('/update_avatar')
  @UseGuards(JwtAuthGuard)
  updateAvatar(@Body('img') newUserName: string, @Req() req) {
    this._usersService.updateAvatar(req.user.id, newUserName);
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
  async getUserInfo(@Param("uid") userId: string): Promise<OutUserInfoDto> {
    return { games: 0, wins: 0, rankPoints: 0, totalScore: 0 };
  }


}
