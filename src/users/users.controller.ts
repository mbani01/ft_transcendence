import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly _usersService: UsersService) {}

  @Get()
  getAll(@Query() paginationQuery: any) {
    const { like, limit } = paginationQuery;
    return this._usersService.findAll();
  }

  @Get('/:id')
  getOne(@Param('id') userId: number) {
    this._usersService.findOne(userId);
  }

  @Get('/me')
  getMe(): string {
    return "this action return route 'me' ";
  }
}
