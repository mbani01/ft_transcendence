/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/09 12:00:29 by mbani             #+#    #+#             */
/*   Updated: 2022/02/10 17:45:10 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


type ball = {
	x: number;
	y: number;
}
export class Game{
	isPublic: boolean;
	Players: Array<any>;
	GameId: string;
	ballPos: Array<number> = [200, -200];
	ball: ball;
	
	constructor(isPublic: boolean, Players: Array<any>)
	{
		this.isPublic = isPublic;
		this.Players = Players;
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

	getInfos()
	{
		return {GameId: this.GameId, ball: this.ball};
	}
}