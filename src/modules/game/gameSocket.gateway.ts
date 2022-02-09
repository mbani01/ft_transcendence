/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameSocket.gateway.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/07 09:34:27 by mbani             #+#    #+#             */
/*   Updated: 2022/02/09 14:33:19 by mbani            ###   ########.fr       */
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
		const GameId = game.getGameId();
		this.joinGameRoom(GameId, Players);
		this.server.to(GameId).emit('gameStarted', GameId);
	}
	
	@SubscribeMessage('joinGame')
	async joinQueue(@ConnectedSocket() socket: any)
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
	
	@SubscribeMessage('sync')
	syncGame(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if (data.GameId)
			socket.to(String(data.GameId)).emit("sync", data);
	}
	
}