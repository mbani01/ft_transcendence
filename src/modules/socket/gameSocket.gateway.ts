/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameSocket.gateway.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/07 09:34:27 by mbani             #+#    #+#             */
/*   Updated: 2022/02/07 16:45:07 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { CustomSocket } from "src/adapters/socket.adapter";
import { gameQueue } from "../../utils/gameQueue";


@WebSocketGateway({ cors: true })
export class gameSocket
{
	publicQueue :gameQueue = new gameQueue(true);
	@SubscribeMessage('Game')
	joinQueue(socket :CustomSocket){
		console.log(socket.user);
		this.publicQueue.isfull();
	}
	
	
} 