/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/09 12:00:29 by mbani             #+#    #+#             */
/*   Updated: 2022/02/09 16:08:30 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class Game{
	isPublic: boolean;
	Players: Array<any>;
	GameId: string;
	
	constructor(isPublic: boolean, Players: Array<any>)
	{
		this.isPublic = isPublic;
		this.Players = Players;
		this.GameId = String(Date.now());
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
}