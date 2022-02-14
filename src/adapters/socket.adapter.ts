/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.adapter.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/04 09:50:56 by mbani             #+#    #+#             */
/*   Updated: 2022/02/14 16:24:07 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';

export interface CustomSocket extends Socket { 
	user: any;
}
  
export class WsAdapter extends IoAdapter {
	createIOServer(port: number, options?: any) {
		const server = super.createIOServer(port, { cors: true , namespace: 'chat'});
		server.use((socket :CustomSocket, next: any)=>{
			const user = {"username": "mbani"};
			socket.user = socket.handshake.headers.token || user;
			//Verify jwt token Here !
			// if (Verified)
			// 	next();
			// else
			// 	next (new Error("Unauthorized !"));
			next();
		});
		return server;
	}
}