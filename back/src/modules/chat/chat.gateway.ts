import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io'
import { CreateMessageColumnDto, CreateMessageDto } from './dto/create-message.dto';
import { CreateMemberColumn, CreateMemberDto } from './dto/create-member.dto';
import { Clients, CustomSocket } from 'src/adapters/socket.adapter';
import { NotFoundException, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  constructor(private readonly _chatService: ChatService) { }

  afterInit(server: any) {
    console.log('Gateway Inited')
  }

  handleDisconnect(client: any) {
    console.log('a user disconnected');
  }

  handleConnection(client: CustomSocket, ...args: any[]) {
    // client.emit('message', 'Welcome to Chat!');
    console.log(`client with id #${client.id} connected`)
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('chat-message')
  async message(@MessageBody() data: any,
    @ConnectedSocket() client: CustomSocket) {
    const { roomID: roomId, timestamp: createdAt, message: content } = JSON.parse(data);
    const userId = Clients.getUserId(client.id);
    const message: CreateMessageColumnDto = { roomId, createdAt, content, userId: +userId }
    await this._chatService.createMessage(message);
    const room = await this._chatService.getRoomById(roomId);
    if (!room) throw new NotFoundException('room not found');
    const outData = {
      roomID: roomId,
      sender: {
        uid: userId,
        name: client.user.username,
        img: client.user.avatar,
      },
      message: message.content,
      timestamp: message.createdAt,
    };
    client.emit('chat-message', outData);
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: CustomSocket, @MessageBody() createMemberDto: any) {
    const { roomID, password } = createMemberDto;
    const userId = Clients.getUserId(client.id);
    console.log('userId: ', userId);
    const member: CreateMemberColumn = {
      roomID,
      userID: +userId,
      password,
      role: 'member'
    };
    try {
       await this._chatService.createMember(member);
    }
    catch(e)
    {
      return { data: { error: e.message } };
    }
    const room = await this._chatService.getRoomById(roomID);
    client.join(room.name);
    return { data: {name: client.user.username, timestamp: Date.now()} }
  }

  @SubscribeMessage('chat-leave')
  async leave(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) {

  }

  @SubscribeMessage('chat-room-invite')
  async roomInvite(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) {
    /** data:
     {
         "uid": number | string,
         "roomID": string,
         "timestamp": Date
     } 
     */

     /** out:
      
      {
        "roomID": number | string,
        "sender": {
            "uid": number | string,
            "name": string,
            "img": string
        }
        "roomInvite": number | string,
        "timestamp": Date
      }
      */
  }

  @SubscribeMessage('chat-duel')
  async duel(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) {
    /**
    {
      "uid": number | string,
      "timestamp": Date
    }
     */

    /** out:
    {
      "roomID": number | string,
      "sender": {
          "uid": number | string,
          "name": string,
          "img": string
      }
      "duel": boolean,
      "timestamp": Date
    }
    */
  }
  
}
