/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameSocket.gateway.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/07 09:34:27 by mbani             #+#    #+#             */
/*   Updated: 2022/02/08 11:56:15 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "http";
import { connected } from "process";
import { CustomSocket } from "src/adapters/socket.adapter";
import { gameQueue } from "../../utils/gameQueue";


@WebSocketGateway({ cors: true })
export class gameSocket
{
	@WebSocketServer()
	server;


	
	publicQueue :gameQueue = new gameQueue(true);
	
	@SubscribeMessage('Game')
	async joinQueue(socket :CustomSocket, @ConnectedSocket() client: any){
		const sockets = await this.server.fetchSockets()
		sockets.forEach(socket => {
			socket.join('test');
			console.log(socket.user);
		});

		client.to("test").emit("test", "hello world");
		console.log(client.user);
	}
	
	
} 