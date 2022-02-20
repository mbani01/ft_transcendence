import { Controller, Get, HttpCode, Param, Req, Res} from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('game')
export class GameController {
	@Get('query')
	getallgame(@Req() request: Request, @Res() res: Response){
		// hmoumani write your queries here !
		
	}

}
