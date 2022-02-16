/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.adapter.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/04 09:50:56 by mbani             #+#    #+#             */
/*   Updated: 2022/02/15 14:33:12 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';
import { activeUsers } from 'src/modules/socket/activeUsers';

export interface CustomSocket extends Socket { 
	user: any;
}
  
const Clients = new activeUsers();
export class WsAdapter extends IoAdapter {
	createIOServer(port: number, options?: any) {
		const server = super.createIOServer(port, { cors: true});
		server.use((socket :CustomSocket, next: any)=>{
			const user = {"username": "mbani"};
			socket.user = socket.handshake.headers.token || user;
			//Verify jwt token Here !
			// if (Verified)
			// 	next();
			// else
			// 	next (new Error("Unauthorized !"));
			Clients.add('1234mbani', 'this is socketId')
			next();
		});
		return server;
	}
}

export {Clients}