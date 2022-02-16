import { Controller, Get, HttpCode, Param, Req, Res} from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('game')
export class GameController {
	@Get('all')
	getallgame(@Req() request: Request, @Res() res: Response){
		console.log(request.params);
		const arr :Array<number> = [];
		arr.push(5);
		res.status(501).send("Hello world");
	}

}
