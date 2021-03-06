/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameSocket.gateway.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/07 09:34:27 by mbani             #+#    #+#             */
/*   Updated: 2022/03/02 18:34:36 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from "@nestjs/websockets";
import { GamePlay } from "./game";
import {GameQueueService} from "./gameQueue"
import { Clients } from '../../adapters/socket.adapter';
import { Game } from "./entities/game.entity";
import {getRepository} from "typeorm";
import { UsersService } from "../users/users.service";
import { User } from "../users/entity/user.entity";
import { Relation } from "../users/entity/relation.entity";
import { subscribeOn } from "rxjs";
import { Socket } from "dgram";

@WebSocketGateway({ cors: true })
export class gameSocketGateway
{
	constructor(
		private readonly _usersService: UsersService,
	  ) { }
	
	@WebSocketServer()
	server;

	Games :Array<GamePlay> = [];
	DefautQueue :GameQueueService = new GameQueueService();
	CustomQueue :GameQueueService = new GameQueueService();
	PrivateQueues :Array<GameQueueService> = [];

	joinGameRoom(gameId, Players)
	{
		Players.forEach(socket => socket.join(gameId));
	}
	
	
	async startGame(GameQueue: GameQueueService, isDefault: boolean)
	{
		const Players = GameQueue.getPlayers();
		const game = new GamePlay(true, Players, isDefault);
		this.Games.push(game);
		const gameInfos = game.getInfos();
		Players[0].GameId = gameInfos.GameId;
		Players[1].GameId = gameInfos.GameId;
		this.joinGameRoom(gameInfos.GameId, Players);
		try {
			let nameUser1:any = (await this._usersService.findById(Number(Players[0].user.sub)));
			let nameUser2:any = (await this._usersService.findById(Number(Players[1].user.sub)));
			nameUser1 = nameUser1 && nameUser1.username || "";
			nameUser2 = nameUser2 && nameUser2.username || "";
			this.server.to(Players[0].id).emit('gameStarted', {GameId: gameInfos.GameId, isDefaultGame: isDefault, ball: gameInfos.ball, isHost: true, nameUser1 , nameUser2});
			this.server.to(Players[1].id).emit('gameStarted', {GameId:gameInfos.GameId, isDefaultGame: isDefault, ball: gameInfos.ball, isHost: false, nameUser1 , nameUser2});
			this.LiveGames()
			Clients.updateState(Players[0].user.sub, "in-game");
			Clients.updateState(Players[1].user.sub, "in-game");
		} catch (error) {
			return {"error":"Unexpected Error"};
		}
	}
	
	@SubscribeMessage('watchGame')
	watchGame(@ConnectedSocket() socket: any, @MessageBody() data :any)	
	{
		if(!data.GameId)
			return ;
		this.Games.forEach(game=>
		{
			if(game.getGameId() === String(data.GameId))
			{
				socket.join(String(data.GameId));
				this.server.to(socket.id).emit('gameStarted', {GameId: game.GameId, isDefaultGame: game.isDefault, isWatcher: true, score: game.score, imageUser1: game.Players[0].user.img, imageUser2: game.Players[1].user.img, nameUser1: game.Players[0].user.username, nameUser2: game.Players[1].user.username});
			}
		});
	}

	@SubscribeMessage('joinDefaultGame')
	joinQueue(@ConnectedSocket() socket: any)
	{
		if (!this.DefautQueue.addUser(socket))
			return ;
		if (this.DefautQueue.isfull())
			this.startGame(this.DefautQueue, true);
	}

	@SubscribeMessage('joinCustomGame')
	joinCustomGame(@ConnectedSocket() socket: any)
	{
		if (!this.CustomQueue.addUser(socket))
			return ;
		if (this.CustomQueue.isfull())
			this.startGame(this.CustomQueue, false);
	}
	
	@SubscribeMessage('leaveQueue')
	leaveQueue(@ConnectedSocket() socket: any, @MessageBody() data: any)
	{
		if (!data || !data.hasOwnProperty('isNormal'))
			return ;
		if(data.isNormal)
			this.DefautQueue.clearQueue();
		else
			this.CustomQueue.clearQueue();
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

	@SubscribeMessage('syncCounter')
	syncCounter(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if (data.GameId && this.isPlayer(socket, String(data.GameId)))
			socket.to(String(data.GameId)).emit("syncCounter", data);
	}

	@SubscribeMessage('syncBall')
	syncBall(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if (data.GameId && this.isPlayer(socket, String(data.GameId)))
			socket.to(String(data.GameId)).emit('syncBall', data);
	}
	
	@SubscribeMessage('SendGameInvitation')
	async privateGame(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if(!data || !data.hasOwnProperty('receiverId') || !data.hasOwnProperty('isDefaultGame'))
			return ;
			//check if user is active
		if (Clients.getUserStatus(Number(data.receiverId)) !== "online")
			return {error: 'user is not available'};
			// create a private queue with a unique id and add host
		const QueueId = String(socket.user.sub) + "_" + String(data.receiverId) + '#' + String(Date.now());
		const expectedPlayers =  [socket.user.sub, data.receiverId];
		const Queue = new GameQueueService(true, QueueId, expectedPlayers, data.isDefaultGame); // Create a new Queue
		if (!Queue.addUser(socket))
			return ;
		this.PrivateQueues.push(Queue);
			// Get receiver socket and send invitation event
		try {
			const sockets = await this.server.fetchSockets()
			sockets.forEach(element=> {
			if (element.user.sub === parseInt(data.receiverId))
			{
				this.server.to(element.id).emit('invitedToGame', {InvitationId: QueueId, SenderName: socket.user.username}); // Invitation sent
				setTimeout(this.expireInvitation.bind(this), 30000, QueueId);
			}
			});
		} catch (error) {
			return {"error": "Unexpected Error"};
		}
	}
	
	expireInvitation(QueueId)
	{
		this.PrivateQueues = this.PrivateQueues.filter(element => element.getId() !== String(QueueId));
	}

	@SubscribeMessage('GameInvitationReceived')
	InvitationReceived(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if (!data || !data.hasOwnProperty('InvitationId') || 
		!data.hasOwnProperty('isAccepted'))
			return ;
		const queue = this.PrivateQueues.find(element => element.getId() === String(data.InvitationId));
		if (queue === undefined)
			return {'error': "Invalid or expired invitation"};
		if (Clients.getUserStatus(queue.getSenderId()) !== 'online')
			return {'error': 'player is not available'};
		if (data.isAccepted === true) // Invitation Accepted
		{
			queue.addUser(socket);
			if (queue.isfull())
				this.startGame(queue, queue.isDefault());
		}
		else if (data.isAccepted === false) // Invitation Rejected
		{
			const host = queue.getPlayers();
			this.server.to(host[0].id).emit("invitationRejected", {error: `${socket.user.username} reject your invite`});
		}
		this.PrivateQueues = this.PrivateQueues.filter(element => element.getId() !== String(data.InvitationId)); // Delete Queue
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
		this.LiveGames();
    }
    
    @SubscribeMessage('focusLose')
    focusLose(@ConnectedSocket() socket: any, @MessageBody() data :any)
    {
        if (data.GameId && this.isPlayer(socket, String(data.GameId)))
            socket.to(String(data.GameId)).emit('focusLose', data);
    }
	

	UpdateScore(gameInfos, WinnerId, LoserId)
	{
		let WinnerScore = 0;
		let LoserScore = 0;
		for(let i = 0 ;  i < 2; ++i)
		{
			if (gameInfos.Players[i].sub === WinnerId && i === 0)
			{
				WinnerScore = gameInfos.score.player1;
				LoserScore = gameInfos.score.player2;
			}
			else if (gameInfos.Players[i].sub === WinnerId && i === 1)
			{
				WinnerScore = gameInfos.score.player2;
				LoserScore = gameInfos.score.player1;
			}
		}
		this._usersService.saveScore(WinnerId, WinnerScore, LoserScore, true);
		this._usersService.saveScore(LoserId, LoserScore, WinnerScore, false);
	}
	
	async GameOver(game :GamePlay, disconnectedPlayer? :any)
	{
		if (game)
		{
			const gameInfos = game.getInfos();
			let winner ;
			let loser ;
			if (disconnectedPlayer !== undefined) // A Player disconnected
			{
				const tmpWinner = game.getPlayers().find(player => player.user.sub !== disconnectedPlayer.user.sub);
				winner = tmpWinner.user;
				loser  = disconnectedPlayer.user;
				this.server.to(gameInfos.GameId).emit('GameOver', {GameId: gameInfos.GameId, Players: gameInfos.Players, 
					disconnectedPlayer: disconnectedPlayer.user});
			}
			else
			{
				winner = game.getWinner();
				loser  = gameInfos.Players.filter(player => player.user !== winner)
				this.server.to(gameInfos.GameId).emit('GameOver', {GameId: gameInfos.GameId, Players: gameInfos.Players, 
					Winner: winner});
			}
			const gameRepo = getRepository(Game);
			try {
				const gamedata = await gameRepo.create({id: gameInfos.GameId, firstPlayer:gameInfos.Players[0].sub, 
					firstPlayerScore: gameInfos.score.player1, secondPlayer: gameInfos.Players[1].sub, 
				secondPlayerScore: gameInfos.score.player2, winner: winner.sub, isDefault: gameInfos.isDefault});
					await gameRepo.save(gamedata);
				this.Games = this.Games.filter(element => element.getGameId() !== gameInfos.GameId);
				this.server.socketsLeave(gameInfos.GameId); // make all players/watcher leave the room
				this.LiveGames();
				Clients.updateState(gameInfos.Players[0].sub, "online");
				Clients.updateState(gameInfos.Players[1].sub, "online");
				this.UpdateScore(gameInfos, winner.sub, loser.sub)
			} catch (error) {
				return {"error": "Unexpected Error"};
			}
		}
	}

	@SubscribeMessage('disconnected')
 	async handleDisconnect(@ConnectedSocket() socket: any) {
		if (this.DefautQueue.removeUser(socket) ||	this.CustomQueue.removeUser(socket))
			return ; // if user is waiting in queue
		const game = this.Games.find(element=> element.isPlayer(socket));
		this.GameOver(game, socket);
		Clients.remove(socket.user.sub);
	}

	@SubscribeMessage('syncPowerUp')
	syncPowerUp(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if (data.GameId && this.isPlayer(socket, String(data.GameId)))
			socket.to(String(data.GameId)).emit('syncPowerUp', data);
	}
	
	@SubscribeMessage('LiveGamesRequest')
	sendLiveGames(@ConnectedSocket() socket: any)
	{
		this.LiveGames();
	}


	@SubscribeMessage('leftGame')
	leftGame(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		const game = this.Games.find(element=> element.isPlayer(socket));
		this.GameOver(game, socket);
		this.Games = this.Games.filter(element => element != game);
	}

	LiveGames()
	{
		const res = [];
		for(let i in this.Games)
			res.push(this.Games[i].getInfos(true));
		this.server.emit('LiveGames', res);
	}

	@SubscribeMessage('PlayerTimeout')
	timeout(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		const game = this.Games.find(element=> element.isPlayer(socket));
		this.GameOver(game, socket);
	}


	@SubscribeMessage('watcherLeft')
	async watcherLeft(@ConnectedSocket() socket: any, @MessageBody() data :any)
	{
		if (!data || !data.hasOwnProperty('GameId'))
			return ;
		socket.leave(data.GameId)
	}
}