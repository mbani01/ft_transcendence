import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io'
import { CreateMessageColumnDto, CreateMessageDto } from './dto/create-message.dto';
import { CreateMemberColumn, CreateMemberDto } from './dto/create-member.dto';
import { Clients, CustomSocket } from 'src/adapters/socket.adapter';
import { NotFoundException, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server } from 'http';
import { CreateRoomDto } from './dto/create-room.dto';
import e from 'express';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly _chatService: ChatService) { }
  @WebSocketServer()
  server;

  afterInit(server: any) {
    console.log('Gateway Inited')
  }

  handleDisconnect(client: any) {
    console.log('a user disconnected');
  }

  async handleConnection(client: CustomSocket, ...args: any[]) {
    const rooms = await this._chatService.getRoomByUid(client.user.sub);
    for (let room of rooms)
      client.join(""+room.roomID)
    console.log(`client with id #${client.id} connected`)
  }
  
  @SubscribeMessage('create-channel')
  async createChannel(@MessageBody() createRoomBodyDto: any, @ConnectedSocket() client: CustomSocket) {
      /** Request
       *  {
            "name": string, // channel's name
            "isPublic": boolean,
            "password"?: string
          }
        */
      const { name, isPublic, password } = createRoomBodyDto;
      if (password?.length < 8)
          return { error: "password too weak" };
      const channelType = this._chatService.getChannelType(isPublic, password);
      const roomEntity: CreateRoomDto = { name, password, channelType, ownerID: client.user.sub }
      let newRoom: any;
      try
      {
        newRoom = await this._chatService.createRoom(roomEntity);
      }
      catch(e)
      {
        return { error: e.message };
      }
      client.join(""+newRoom.roomID);
      return newRoom;
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('chat-message')
  async message(@MessageBody() data: any,
    @ConnectedSocket() client: CustomSocket) {
    const { roomID, timestamp: createdAt, message: content } = JSON.parse(data);
    const userID = client.user.sub;
    const message: CreateMessageColumnDto = { roomID, createdAt, content, userID: +userID }
    await this._chatService.createMessage(message);
    const room = await this._chatService.getRoomById(roomID);
    if (!room) throw new NotFoundException('room not found');
    const outData = {
      roomID,
      sender: {
        uid: userID,
        name: client.user.username,
        img: client.user.img,
      },
      message: message.content,
      timestamp: message.createdAt,
    };
    this.server.to(""+roomID).emit('chat-message', outData);
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: CustomSocket, @MessageBody() createMemberDto: any) {
    const { roomID, password } = createMemberDto;
    const userID = client.user.sub;
    const member: CreateMemberColumn = {
      roomID,
      userID: +userID,
      password,
      role: 'member'
    };
    try {
      await this._chatService.createMember(member);
    }
    catch (e) {
      return { error: e.message };
    }
    const room = await this._chatService.getRoomById(roomID);
    client.join(""+roomID);
    return room; 
  }

  @SubscribeMessage('chat-leave')
  async leave(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) {
    /**data:
    {
      "roomID": number | string,
    }
    */

    const user = client.user;
    const roomID = data.roomID;
    try {
      const room = await this._chatService.getRoomById(roomID);
      await this._chatService.getMemberByQuery(user.id, roomID);

    } catch (e) {

    }

    client.leave('roomName');

    /** out:
    {
      "name": string,
    }

    error:
    {
      "error": string,
    }
     */
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
