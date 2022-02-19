/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   activeUsers.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/15 14:12:49 by mbani             #+#    #+#             */
/*   Updated: 2022/02/19 14:48:17 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// type user = {
// 	userId: String;
// 	socketId: String;
// }

export class activeUsers {
	private users = new Map();

	add(userId: string, socketId: string) {
		this.users.set(userId, socketId);
		// this.users.push({userId: UserId, socketId: SocketId});
	}

	remove(userId: string) {
		this.users.delete(userId);
		// this.users = this.users.filter(element => element.userId !== UserId);
	}

	// removeByUserId(userId: String) {
	// 	this.users.forEach((value: string, key: string) => {
	// 		if (value === userId)
	// 			this.users.delete(key);
	// 	});
	// 	// this.users = this.users.filter(element => element.socketId !== socketId);
	// }

	getSocketId(userId: string) {
		return this.users.get(userId);
	}
	
	get()
	{
		return this.users;
	}
	
	isActiveUser(userId: string) {
		return (this.users.has(userId));
		// const user = this.users.find(element=> element.userId === UserId);
	}
}