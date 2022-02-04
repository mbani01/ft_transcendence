/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.gateway.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/04 09:51:02 by mbani             #+#    #+#             */
/*   Updated: 2022/02/04 17:52:09 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { CustomSocket } from "src/adapters/socket.adapter";

@WebSocketGateway(9000, { cors: true })
export class socketGateway {
  @SubscribeMessage('message')
  handleMessage(client: CustomSocket, message: any): void {
    console.log(message);
  }
@SubscribeMessage('connection')
handleConnection(client: CustomSocket, data){
	console.log(client.handshake.headers.token);
}
}