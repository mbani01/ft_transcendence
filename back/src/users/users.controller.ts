import { Controller, Get, Param, Query } from "@nestjs/common";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  async getAll(@Query() paginationQuery: PaginationQueryDto) {
    return await this._usersService.findAll(paginationQuery);
  }

  @Get("/:id")
  async getOne(@Param("id") userId: number | string) {
    if (typeof userId == "number")
      return await this._usersService.findById(userId);
    return await this._usersService.findByUserName(userId);
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
  @Get("/user-info/:uid")
  async getUserInfo(@Param("uid") userId: string) {
    return `this action returns the infos of the user with id #${userId} `;
  }

  
}
