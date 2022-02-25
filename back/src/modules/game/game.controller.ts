import { Controller, Get, HttpCode, Param, Req, Res} from '@nestjs/common';
import { Request, Response } from 'express';
import {getConnection, getRepository} from "typeorm";
import { User } from '../users/entity/user.entity';
import { UsersService } from "../users/users.service";


@Controller('game')
export class GameController {
	constructor(
		private readonly _usersService: UsersService,
	  ) { }
	@Get()
	async getallgame(@Req() request: Request, @Res() res: Response, @Param('like') like: string){
		// hmoumani write your queries here !
		const user = await getRepository(User)
		.createQueryBuilder("user")
		.where("user.username like :name", { name:`${like}%` })
                  .getMany();

		console.log("users " + user[0].username);
	}

	@Get('leaderBoard')
	async getLeaderBoard(@Req() request: Request, @Res() res: Response)
	{
		return await this._usersService.getLeaderBoard();
	}

}
