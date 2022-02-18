import { BadRequestException, Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OutUserInfoDto } from "./dto/out-user-info.dto";
import { OutUserDto } from "./dto/out-user.dto";
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
      return { userId: user.id, username: user.username, avatar: user.avatar };
    }
    const user = await this._usersService.findByUserName(req.user.username);
    return { userId: user.id, username: user.username, avatar: user.avatar };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentProfile(@Req() req): OutUserDto {
    const user = req.user;
    console.log('user/me === ', user);
    return { userId: user.id, username: user.username, avatar: user.avatar };
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
