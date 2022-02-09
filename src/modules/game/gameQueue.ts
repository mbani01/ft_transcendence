/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.service.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/09 10:52:22 by mbani             #+#    #+#             */
/*   Updated: 2022/02/09 11:12:55 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from "@nestjs/common";

@Injectable()
export class GameQueueService{
	
	size: number;
	data: Array<any>;
	
	constructor()
	{
		console.log("Queue Created !");
		this.size = 0;
		this.data = [];
	}

	addUser(user)
	{
		this.data.push(user);
		this.size += 1;
	}
	
	clearQueue()
	{
		this.data.length = 0;
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
			Players.push(this.data.shift());
		if (this.data.length === 0)	
			this.clearQueue();
		return Players;
	}
}
