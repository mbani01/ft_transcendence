/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.adapter.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/04 09:50:56 by mbani             #+#    #+#             */
/*   Updated: 2022/02/16 14:36:43 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';
import { activeUsers } from '../modules/socket/activeUsers';
// import * as jwt from 'jsonwebtoken';
// import { JwtConstants } from 'src/auth/constants';

export interface CustomSocket extends Socket {
	user: any;
}

const Clients = new activeUsers();
export class WsAdapter extends IoAdapter {

	createIOServer(port: number, options?: any) {
		const server = super.createIOServer(port, { cors: true });
		server.use((socket: CustomSocket, next: any) => {
			console.log("here");
			const user = { "username": "mbani" };
			socket.user = socket.handshake.headers.token || user;
			// const token = socket.user;
			// const decoded = jwt.verify(token, JwtConstants.jwtSecret);
			// console.log(decoded);
			//Verify jwt token Here !
			// if (Verified)
			// 	next();
			// else
			// 	next (new Error("Unauthorized !"));
			// Clients.add('1234mbani', 'this is socketId')
			console.log("try to connect");
			next();
		});
		return server;
	}
}

export { Clients }