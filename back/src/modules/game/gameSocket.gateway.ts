/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameSocket.gateway.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/07 09:34:27 by mbani             #+#    #+#             */
/*   Updated: 2022/02/17 09:44:02 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from "@nestjs/websockets";
import { Game } from "./game";
import {GameQueueService} from "./gameQueue"
import { Clients } from '../../adapters/socket.adapter'


@WebSocketGateway({ cors: true })
export class gameSocketGateway
{
	@WebSocketServer()
	server;

	Games :Array<Game> = [];
	DefautQueue :GameQueueService = new GameQueueService();
	CustomQueue :GameQueueService = new GameQueueService();
	PrivateQueues :Array<GameQueueService> = [];

	joinGameRoom(gameId, Players)
	{
		Players.forEach(socket=> socket.join(gameId));
	}

	async startGame(GameQueue: GameQueueService, isDefault: boolean)
	{
		const Players = GameQueue.getPlayers();
		if (Players[0] == Players[1])
			return ;
		const game = new Game(true, Players, isDefault);
		this.Games.push(game);
		const gameInfos = game.getInfos();
		Players[0].GameId = gameInfos.GameId;
		Players[1].GameId = gameInfos.GameId;
		this.joinGameRoom(gameInfos.GameId, Players);
		this.server.to(Players[0].id).emit('gameStarted', {GameId: gameInfos.GameId, isDefaultGame: isDefault, ball: gameInfos.ball, isHost: true});
		this.server.to(Players[1].id).emit('gameStarted', {GameId:gameInfos.GameId, isDefaultGame: isDefault, ball: gameInfos.ball, isHost: false});
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

	@SubscribeMessage('joinDefaultGame')
	joinQueue(@ConnectedSocket() socket: any)
	{
		this.DefautQueue.addUser(socket);
		if (this.DefautQueue.isfull())
			this.startGame(this.DefautQueue, true);
		// const sockets = await this.server.fetchSockets();
		// sockets.forEach(socket => {
		// 	socket.join('test');
		// 	console.log(socket.user);
		// });
		// client.to("test").emit("test", "hello world");
		// console.log(client.user);
	}

	@SubscribeMessage('joinCustomGame')
	joinCustomGame(@ConnectedSocket() socket: any)
	{
		this.CustomQueue.addUser(socket);
		if (this.CustomQueue.isfull())
			this.startGame(this.CustomQueue, false);
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
			socket.to(String(data.GameId)).emit('syncBall', data);
	}

	// @SubscribeMessage('leaveGame')
	// leaveGame(@ConnectedSocket() socket: any, @MessageBody() data :any)
	// {
	// 	/* Game is Over should :
	// 	 	- leave room for both players && watchers
	// 		- save score for both players
	// 		- delete game 
	// 	*/
	// 	if (!data.GameId && this.isPlayer(socket, String(data.GameId)))
	// 	{
			
	// 	}
	// }
	
	@SubscribeMessage('createPrivateGame')
	privateGame(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		
	}
	
	@SubscribeMessage('syncRound')
    syncRound(@ConnectedSocket() socket: any, @MessageBody() data :any)
    {
		if (!data.GameId || isNaN(data.player1_score) || isNaN(data.player2_score))
			return;
        if (this.isPlayer(socket, String(data.GameId)))
		{
            socket.to(String(data.GameId)).emit('syncRound', data);
			const currentGame = this.Games.find(element=> element.getGameId() === String(data.GameId));
			currentGame.updateScore({player1: data.player1_score, player2: data.player2_score});
			if (data.player1_score >= 10 || data.player2_score >= 10)
			{
				const game = this.Games.find(element=> element.isPlayer(socket));
				this.GameOver(game);
			}
		}
    }
    
    @SubscribeMessage('focusLose')
    focusLose(@ConnectedSocket() socket: any, @MessageBody() data :any)
    {
        if (data.GameId && this.isPlayer(socket, String(data.GameId)))
            socket.to(String(data.GameId)).emit('focusLose', data);
    }
	
	GameOver(game :Game, disconnectedPlayer? :any)
	{
		if (game)
		{
			const gameInfos = game.getInfos();
			if (disconnectedPlayer !== undefined) // A Player disconnected
			{
				this.server.to(gameInfos.GameId).emit('GameOver', {GameId: gameInfos.GameId, Players: gameInfos.Players, 
				disconnectedPlayer: disconnectedPlayer.user});
			}
			else
			{
				const winner = game.getWinner();
				this.server.to(gameInfos.GameId).emit('GameOver', {GameId: gameInfos.GameId, Players: gameInfos.Players, 
					Winner: winner});
			}
			this.server.socketsLeave(gameInfos.GameId); // make all players/watcher leave the room
		}
	}

	@SubscribeMessage('disconnected')
 	async handleDisconnect(@ConnectedSocket() socket: any) {
		if (this.DefautQueue.removeUser(socket) ||	this.CustomQueue.removeUser(socket))
			return ; // if user is waiting in queue
		const game = this.Games.find(element=> element.isPlayer(socket));
		this.GameOver(game, socket);
		this.Games = this.Games.filter(element => element != game);
	}

	@SubscribeMessage('syncPowerUp')
	syncPowerUp(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if (data.GameId && this.isPlayer(socket, String(data.GameId)))
			socket.to(String(data.GameId)).emit('syncPowerUp', data);
	}
	
}