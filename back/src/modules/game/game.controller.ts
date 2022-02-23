import { Controller, Get, HttpCode, Param, Req, Res} from '@nestjs/common';
import { Request, Response } from 'express';
import {getConnection, getRepository} from "typeorm";
import { User } from '../users/entity/user.entity';

@Controller('game')
export class GameController {
	@Get()
	async getallgame(@Req() request: Request, @Res() res: Response, @Param('like') like: string){
		// hmoumani write your queries here !
		const user = await getRepository(User)
		.createQueryBuilder("user")
		.where("user.username like :name", { name:`${like}%` })
                  .getMany();

		console.log("users " + user[0].username);
	}

}
