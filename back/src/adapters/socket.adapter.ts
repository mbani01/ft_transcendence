/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.adapter.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/04 09:50:56 by mbani             #+#    #+#             */
/*   Updated: 2022/02/20 10:29:57 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';
import { activeUsers } from '../modules/socket/activeUsers';
import * as jwt from 'jsonwebtoken';

export interface CustomSocket extends Socket {
	user: any;
}	

const Clients = new activeUsers();
export class WsAdapter extends IoAdapter {

	createIOServer(port: number, options?: any) {
		const server = super.createIOServer(port, { cors: true });
		server.use((socket: CustomSocket, next: any) => {
			let decoded;
			try
			{
				const token = socket.handshake.headers.cookie
				.split('; ')
				.find((cookie: string) => cookie.startsWith('access_token'))
				.split('=')[1];
				decoded = jwt.verify(token, `${process.env.JWT_KEY}`);
				socket.user = decoded;
				console.log(socket.user);
			}
			catch (error)
			{
				next (new Error("Unauthorized !"));
			}
			if (decoded)
			{
				Clients.add(socket.user.sub, socket.id);
				next();
			}
			else
				next (new Error("Unauthorized !"));
		});
		return server;
	}
}

export { Clients }