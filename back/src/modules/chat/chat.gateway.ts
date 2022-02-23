import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'socket.io'
import { CreateMessageColumnDto } from './dto/create-message.dto';
import { CreateMemberColumn } from './dto/create-member.dto';
import { Clients, CustomSocket } from 'src/adapters/socket.adapter';
import {Body, Injectable, NotFoundException, Param, Patch, Req, UseGuards} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomEntity } from './entities/room.entity';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {User} from "../users/entity/user.entity";
import {UnmuteAndUnbanDto} from "./dto/params.dto";

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly _chatService: ChatService) { }
  @WebSocketServer()
  public server: Server;

  afterInit(server: any) {
    console.log('Gateway Inited')
  }

  handleDisconnect(client: any) {
    console.log('a user disconnected');
  }

  async handleConnection(client: CustomSocket, ...args: any[]) {
    const rooms = await this._chatService.getRoomByUid(client.user.sub);
    for (let room of rooms)
      client.join("" + room.roomID)
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
    const user = await this._chatService._userService.findById(client.user.sub);
    let newRoom: any;
    try {
      newRoom = await this._chatService.createRoom(roomEntity);
      await this._chatService.createMember({
        user,
        roomID: newRoom.roomID,
        userID: client.user.sub,
        password: newRoom.password,
        role: 'admin'
      }
      )
    }
    catch (e) {
      return { error: e.message };
    }
    client.join("" + newRoom.roomID);
    return newRoom;
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('chat-message')
  async message(@MessageBody() data: any,
    @ConnectedSocket() client: CustomSocket) {
    const { roomID, timestamp: createdAt, message: content } = JSON.parse(data);
    const userID = client.user.sub;
    const user = await this._chatService.getMember({ roomID, userID });
    if (user.isBaned || user.isMuted) 
    {
      client.emit('chat-message', { error: 'you can\'t send messages to this room!' });
      return;
    }
    const message: CreateMessageColumnDto = { roomID, createdAt, content, userID: +userID }
    const room = await this._chatService.getRoomById(roomID);
    if (!room) throw new NotFoundException('room not found');
    await this._chatService.createMessage(message);
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
    this.server.to("" + roomID).emit('chat-message', outData);
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: CustomSocket, @MessageBody() createMemberDto: any) {
    const { roomID, password } = createMemberDto;
    const userID = client.user.sub;
    const user = await this._chatService._userService.findById(userID);
    const member: CreateMemberColumn = {
      user,
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
    client.join("" + roomID);
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
      await this._chatService.removeMemberFromRoom(roomID, user.sub);
      this.server.to(String(roomID)).emit('chat-leave', { name: user.username });
      // console.log('deleted members: \n')
      // console.log(members);
      // console.log('----------------------------------------------------------------');
    } catch (e) {
      return { error: e.message };
    }

    client.leave(String(roomID));

    /** out:
    {
      "roomID": number,
    }
  
    error:
    {
      "error": string,
    }
     */
    return { roomID };
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

    const { name, roomID } = data;
    const user = await this._chatService._userService.findByUserName(name);
    if (!user)
      return { error: 'no such user' };
    try {
      const room = await this._chatService.getRoomById(roomID);
      await this._chatService.createMember({
        user,
        roomID,
        userID: user.id,
        password: room.password,
        role: 'member'
      });
    } catch (e) {
      return { error: e.message };
    }
    const res = await this.server.fetchSockets();
    const otherUserClient = res.find(clt => clt.id === Clients.getSocketId(user.id));
    if (otherUserClient)
      otherUserClient.join(String(roomID));
  }

  @SubscribeMessage('chat-conversation')
  async DM(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) {
    const { otherUser } = data;
    let newDM: RoomEntity;
    try {
      newDM = await this._chatService.createDM({ isChannel: false, channelType: 'private', name: `DM${client.user.sub}${otherUser}` }, { userID1: client.user.sub, userID2: otherUser });
    } catch (e) {
      return { error: e.message };

    }

    const res = await this.server.fetchSockets();
    const otherUserClient = res.find(clt => clt.id === Clients.getSocketId(otherUser));
    if (otherUserClient)
      otherUserClient.join(String(newDM.roomID));
    client.join(String(newDM.roomID));
    return newDM;
  }

  @SubscribeMessage('ban')
  async banMember(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) { // userID is the id of the user to ban
    console.log()
    const {roomID, userID} = data;
    try {
      await this._chatService.banMember(roomID, userID);
    } catch (e) {
        return { error: e.message };
    }
    this.server.to(String(roomID)).emit('ban', {roomID, userID})
  }

  @SubscribeMessage('mute')
  async muteMember(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) { // userID is the id of the user to ban
    const {userID, timeout, roomID} = data;
    try {
      await this._chatService.muteMember(roomID, userID);
      const time = setTimeout(() => {
        this._chatService.unmuteMember(roomID, userID);
        this.server.to(String(roomID)).emit('unmute', {roomID, userID});
      }, timeout);
      this._chatService.timers.set(`${userID}-${roomID}`, time);
    } catch (e) {
      return { error: e.message };
    }
    this.server.to(String(roomID)).emit('mute', {roomID, userID})
  }


  @SubscribeMessage('unmute')
  async unmuteMember(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) {
    const { roomID, uid } = data;
    try {
      await  this._chatService.unmuteMember(roomID, uid);
    } catch (e) {
      return { error: e.message };
    }
    this.server.to(String(roomID)).emit('unmute', {roomID, uid})
  }

  @SubscribeMessage('unban')
  async unbanMember(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) {
    const { roomID, uid } = data;
    try {
      await this._chatService.unbanMember(roomID, uid);
    } catch (e) {
      return { error: e.message };
    }
    this.server.to(String(roomID)).emit('unban', {roomID, uid})
  }
}
