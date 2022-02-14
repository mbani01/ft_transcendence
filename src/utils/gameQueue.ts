  /* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameQueue.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/07 13:19:39 by mbani             #+#    #+#             */
/*   Updated: 2022/02/07 14:46:03 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


export class gameQueue{
	
	isPublic: boolean;
	size: number;
	data: Array<any>;
	
	constructor(isPublic: boolean)
	{
		this.isPublic = isPublic;
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