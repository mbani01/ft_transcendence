/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameSocket.gateway.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/07 09:34:27 by mbani             #+#    #+#             */
/*   Updated: 2022/02/11 19:15:02 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from "@nestjs/websockets";
import { Game } from "./game";
import {GameQueueService} from "./gameQueue"


@WebSocketGateway({ cors: true })
export class gameSocketGateway
{
	@WebSocketServer()
	server;

	Games :Array<Game> = [];

	publicQueue :GameQueueService = new GameQueueService();

	joinGameRoom(gameId, Players)
	{
		Players.forEach(socket=> socket.join(gameId));
	}

	async startGame()
	{
		const Players = this.publicQueue.getPlayers();
		if (Players[0] == Players[1])
			return ;
		const game = new Game(true, Players);
		this.Games.push(game);
		const gameInfos = game.getInfos();
		this.joinGameRoom(gameInfos.GameId, Players);
		this.server.to(Players[0].id).emit('gameStarted', {GameId: gameInfos.GameId, ball: gameInfos.ball, isHost: true});
		this.server.to(Players[1].id).emit('gameStarted', {GameId:gameInfos.GameId, ball: gameInfos.ball, isHost: false});
	}
	
	@SubscribeMessage('watchGame')
	watchGame(@ConnectedSocket() socket: any, @MessageBody() data :any)	
	{
		if(!data.GameId)
			return ;
		this.Games.forEach(game=>
		{
			if(game.getGameId() === String(data.GameId))
				socket.join(String(data.GameId));
		});
	}

	@SubscribeMessage('joinGame')
	joinQueue(@ConnectedSocket() socket: any)
	{
		this.publicQueue.addUser(socket);
		if (this.publicQueue.isfull())
			this.startGame();
		// const sockets = await this.server.fetchSockets();
		// sockets.forEach(socket => {
		// 	socket.join('test');
		// 	console.log(socket.user);
		// });
		// client.to("test").emit("test", "hello world");
		// console.log(client.user);
	}
	
	isPlayer(socket: any, GameId: string)
	{
		const game = this.Games.find(element=> element.getGameId() === GameId);
		if (game !== undefined)
			return game.isPlayer(socket);
		return false;
	}

	@SubscribeMessage('sync')
	syncGame(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if (data.GameId && this.isPlayer(socket, String(data.GameId)))
			socket.to(String(data.GameId)).emit("sync", data);
	}

	@SubscribeMessage('syncBall')
	syncBall(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if (data.GameId && this.isPlayer(socket, String(data.GameId)))
			this.server.to(String(data.GameId)).emit('syncBall', data);
	}
	
}