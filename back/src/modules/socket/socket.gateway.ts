import { Injectable } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";

@Injectable()
@WebSocketGateway(80)
export class socketGateway {
//   @WebSocketServer()
//   server;

//   @SubscribeMessage('message')
//   handleMessage(@MessageBody() message: string): void {
//     this.server.emit('message', message);
//   }
@SubscribeMessage('connection')
handleConnection(client, data){
	console.log(client.handshake);
}
}