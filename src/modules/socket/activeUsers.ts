/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   activeUsers.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/15 14:12:49 by mbani             #+#    #+#             */
/*   Updated: 2022/02/15 14:39:15 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

type user = {
	userId: String;
	socketId: String;
}

export class activeUsers
{
	users: Array<any> = [];

	add(UserId, SocketId)
	{
		this.users.push({userId: UserId, socketId: SocketId});
	}

	removeByUserId(UserId :String)
	{
		this.users = this.users.filter(element => element.userId !== UserId);
	}

	removeBySocketId(socketId :String)
	{
		this.users = this.users.filter(element => element.socketId !== socketId);
	}

	get()
	{
		return this.users;
	}

	isActiveUser(UserId)
	{
		const user = this.users.find(element=> element.userId === UserId);
		return (user !== undefined);
	}
}