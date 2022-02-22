import { Controller, Get, HttpCode, Param, Req, Res} from '@nestjs/common';
import { Request, Response } from 'express';
import {getConnection} from "typeorm";

@Controller('game')
export class GameController {
	@Get('query')
	getallgame(@Req() request: Request, @Res() res: Response){
		// hmoumani write your queries here !
		// const user = getConnection().createQueryBuilder().select("user").from(User, "user").
		// console.log()
	}

}
