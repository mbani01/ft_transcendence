/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.adapter.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/04 09:50:56 by mbani             #+#    #+#             */
/*   Updated: 2022/02/07 16:45:13 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';

export interface CustomSocket extends Socket { 
	user: any;
}
  
export class WsAdapter extends IoAdapter {
	createIOServer(port: number, options?: any) {
		const server = super.createIOServer(port, { cors: true });
		server.use((socket :CustomSocket, next: any)=>{
			socket.user = "mbani";
			//Verify jwt token Here !
			// if (Verified)
			// 	next();
			// else
			// 	next (new Error("Unauthorized !"));
			console.log("Callled");
			next();
		});
		return server;
	}
}