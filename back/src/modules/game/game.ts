/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/09 12:00:29 by mbani             #+#    #+#             */
/*   Updated: 2022/02/21 16:55:17 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


type ball = {
	x: number;
	y: number;
}

type score = {
	player1: number;
	player2: number;
}
export class GamePlay
{
	isPublic: boolean;
	Players: Array<any>;
	GameId: string;
	ballPos: Array<number> = [600, -600];
	ball: ball;
	score: score;
	isDefault: boolean;
	
	constructor(isPublic: boolean, Players: Array<any>, isDefault: boolean)
	{
		this.isPublic = isPublic;
		this.isDefault = isDefault;
		this.Players = Players;
		this.score = {player1: 0, player2: 0};
		this.GameId = String(Date.now());
		this.ball = {x: ((Math.floor(Math.random() * (100 - 2) + 2) % 2) === 0) ? this.ballPos[0] : this.ballPos[1],
			 y:((Math.floor(Math.random() * (100 - 2) + 2) % 2) === 0) ? this.ballPos[0] : this.ballPos[1]};
	}
	
	getGameId() :string
	{
		return this.GameId;
	}

	getPlayers() :Array<any>
	{
		return this.Players;
	}

	isPlayer(player)
	{
		const found = this.Players.find(element=> element === player);
		return (found !== undefined);
	}

	isHost(Player)
	{
		return Player === Player[0];
	}

	getInfos(isLive: boolean = false)
	{
		if (isLive)
			return {GameId: this.GameId, Players: [this.Players[0].user, this.Players[1].user], score: this.score, isDefault: this.isDefault}
		else
			return {GameId: this.GameId, ball: this.ball, Players: [this.Players[0].user, this.Players[1].user], score: this.score, isDefault: this.isDefault};
	}
	getWinner()
	{
		if (this.score.player1 >= 10)
			return this.Players[0].user;
		if (this.score.player2 >= 10)
			return this.Players[1].user;
		return null;
	}
	updateScore(score: score)
	{
		this.score = score;
	}
}