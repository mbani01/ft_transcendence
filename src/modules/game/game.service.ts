import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
	enterQueue()
	{
		console.log("Entered The queue waiting for players to join ...");
	}
}
