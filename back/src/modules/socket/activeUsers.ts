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

// type user = {
// 	userId: String;
// 	socketId: String;
// }

export class activeUsers {
	private users = new Map();

	add(userId: string, socketId: string) {
		this.users.set(socketId, userId);
		// this.users.push({userId: UserId, socketId: SocketId});
	}

	removeBySocketId(socketId: string) {
		this.users.delete(socketId);
		// this.users = this.users.filter(element => element.userId !== UserId);
	}

	removeByUserId(userId: String) {
		this.users.forEach((value: string, key: string) => {
			if (value === userId)
				this.users.delete(key);
		});
		// this.users = this.users.filter(element => element.socketId !== socketId);
	}

	getUserId(socketId: string) {
		return this.users.get(socketId);
	}

	isActiveUser(socketId: string) {
		return (this.users.has(socketId));
		// const user = this.users.find(element=> element.userId === UserId);
	}
}