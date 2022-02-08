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
	data: Array<string>;
	
	constructor(isPublic: boolean)
	{
		this.isPublic = isPublic;
		this.size = 0;
		this.data = [];
	}

	addUser(userId)
	{
		this.data.push(userId);
		this.size += 1;
	}
	
	clearQueue()
	{
		this.data.length = 0;
		this.size = 0;
	}

	isfull()
	{
		console.log(this.size);
		return (this.size === 2) 
	}
}
