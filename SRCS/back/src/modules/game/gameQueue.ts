/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameQueue.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/09 10:52:22 by mbani             #+#    #+#             */
/*   Updated: 2022/03/02 16:53:23 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from "@nestjs/common";

@Injectable()
export class GameQueueService{
	
	size: number;
	Players: Array<any>;
	isPrivate: boolean;
	id: string;
	PrivateClients :Array<string>;
	isDefaultGame ?: boolean;
	
	constructor(isPrivate?: boolean, QueueId?: string, expectedClientId?: Array<string>, isDefaultGame ?: boolean)
	{
		this.size = 0;
		this.Players = [];
		this.isPrivate = isPrivate || false;
		this.id = QueueId || null;
		this.PrivateClients = expectedClientId || [];
		this.isDefaultGame = isDefaultGame;
	}

	addUser(user)
	{
		if (this.Players.find(element => element.user.sub === user.user.sub))
			return false; // The same user trying to enter the queue twice
		// if (this.isPrivate && !this.PrivateClients.find(element=> element === user.user.id)) 
		// 	return false; // if an unexpected Player cauth ;)
		this.Players.push(user);
		this.size += 1;
		return true;
	}
	
	isDefault()
	{
		return this.isDefaultGame;
	}

	clearQueue()
	{
		this.Players.length = 0;
		this.size = 0;
	}
 
	isfull()
	{
		return (this.size === 2);
	}

	getPlayers()
	{
		let Players: Array<any> = [];
		for(let i = 0 ; i < 2; ++i)
			Players.push(this.Players.shift());
		if (this.Players.length === 0)
			this.clearQueue();
		return Players;
	}

	removeUser(user)
	{
		let removed = false;
		this.Players = this.Players.filter(element => element !== user);
		if (this.size !== this.Players.length)
			removed = true;
		this.size = this.Players.length;
		return removed;
	}

	getId()
	{
		return this.id || null;
	}

	getSenderId()
	{
		return this.Players[0].user.sub;
	}
}
