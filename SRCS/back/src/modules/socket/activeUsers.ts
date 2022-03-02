/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   activeUsers.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/15 14:12:49 by mbani             #+#    #+#             */
/*   Updated: 2022/03/02 18:02:45 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { elementAt, throwIfEmpty } from "rxjs";

// type user = {
// 	userId: number;
// 	socketId: String;
// }

export class activeUsers {
	private users = new Map();

	add(userId: number, socketId: string) {
		this.users.set(userId, {socketId: socketId, state: "online"});
	}

	remove(userId: number) {
		this.users.delete(userId);
	}

	getSocketId(userId: number): any {
		return this.users.get(userId);
	}
	
	get()
	{
		return this.users;
	}
	
	isActiveUser(userId: number) {
		return (this.users.has(userId));
	}

	updateState(userId: number, state: string)
	{
		this.users.forEach((val, key) => {
			if (key === userId)
				val.state = state;
		});
	}

	getUserStatus(userId: number): string
	{
		const found = this.users.get(userId);
		if (!found)
			return "offline";
		return found.state;
	}
}