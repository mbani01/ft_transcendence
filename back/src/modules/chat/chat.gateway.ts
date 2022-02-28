import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server } from 'socket.io';
import { CreateMessageColumnDto } from './dto/create-message.dto';
import { CreateMemberColumn } from './dto/create-member.dto';
import { Clients, CustomSocket } from 'src/adapters/socket.adapter';
import { NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomEntity } from './entities/room.entity';
import * as bcrypt from 'bcryptjs';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly _chatService: ChatService) {}
  @WebSocketServer()
  public server: Server;

  afterInit(server: any) {
    console.log('Gateway Inited');
  }

  handleDisconnect(client: any) {
    console.log('a user disconnected');
  }

  async handleConnection(client: CustomSocket, ...args: any[]) {
    const rooms = await this._chatService.getRoomByUid(client.user.sub);
    for (let room of rooms) client.join('' + room.roomID);
  }

  @SubscribeMessage('create-channel')
  async createChannel(
    @MessageBody() createRoomBodyDto: any,
    @ConnectedSocket() client: CustomSocket,
  ) {
    /** Request
     *  {
          "name": string, // channel's name
          "isPublic": boolean,
          "password"?: string
        }
      */
    let { name, isPublic, password } = createRoomBodyDto;
    try {
      if (
        password?.length < 8 ||
        password?.match('^(?=.*[A-Za-z])(?=.*d)[A-Za-zd]{8,}$')
      )
        return { error: 'password too weak' };
      if (!name.length || name.length > 20)
        return { error: 'name should be between 1 and 20' };
      const channelType = this._chatService.getChannelType(isPublic, password);

      /* Bcrypt password */
      if (password) {
        try {
          await bcrypt
            .hash(password, 10)
            .catch((reason) => {
              throw reason;
            })
            .then((value) => {
              password = value;
            });
        } catch (reason) {
          return { error: reason };
        }
      }

      const roomEntity: CreateRoomDto = {
        name,
        password,
        channelType,
        ownerID: client.user.sub,
      };
      const user = await this._chatService._userService.findById(
        client.user.sub,
      );
      if (!user) return { error: 'no such user' };
      let newRoom: any;
      newRoom = await this._chatService.createRoom(roomEntity);
      await this._chatService.createMember({
        user,
        roomID: newRoom.roomID,
        userID: client.user.sub,
        password: newRoom.password,
        role: 'admin',
      });
      client.join('' + newRoom.roomID);
      return newRoom;
    } catch (e) {
      return { error: e.message };
    }
  }

  @SubscribeMessage('chat-message')
  async message(
    @MessageBody() data: any,
    @ConnectedSocket() client: CustomSocket,
  ) {
    try {
      const {
        roomID,
        timestamp: createdAt,
        message: content,
      } = JSON.parse(data);
      const userID = client.user.sub;
      const user = await this._chatService.getMember({ roomID, userID });
      if (!(await this._chatService._userService.findById(userID)))
        return { error: 'no such user' };
      if (user.isBaned || user.isMuted)
        return { error: user.isBaned ? 'you are banned' : 'you are muted' };
      const message: CreateMessageColumnDto = {
        roomID,
        createdAt,
        content,
        userID: +userID,
      };
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
      let relations = await this._chatService._userService._relationsRepo.find({
        relations: ['userSecond', 'blocker', 'userFirst'],
        where: {
          userSecond: await this._chatService._userService.findById(
            client.user.sub,
          ),
        },
      });
      if (relations.length)
        relations = relations.filter((rel) => rel.blocker !== null);
      let socketsArr = [];
      for (let relation of relations) {
        if (!Clients.isActiveUser(relation.userFirst.id)) continue;
        const sockets = await this.server
          .in(Clients.getSocketId(relation.userFirst.id).socketId)
          .fetchSockets();
        if (sockets.length === 0) continue;
        sockets[0].join('U' + userID);
        socketsArr.push(sockets[0]);
      }
      this.server
        .to('' + roomID)
        .except('U' + userID)
        .emit('chat-message', outData);
      for (let socket of socketsArr) socket.leave('U' + userID);
    } catch (e) {
      return { error: e.message };
    }
  }

  @SubscribeMessage('join')
  async join(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() createMemberDto: any,
  ) {
    const { roomID, password } = createMemberDto;
    try {
      const userID = client.user.sub;
      const user = await this._chatService._userService.findById(userID);
      if (!user) return { error: 'no such user' };
      const room = await this._chatService.getRoomById(roomID);
      if (!room) return { error: 'no such room' };
      const member: CreateMemberColumn = {
        user,
        roomID,
        userID: +userID,
        password,
        role: 'member',
      };
      await this._chatService.createMember(member);
      client.join('' + roomID);
      return room;
    } catch (e) {
      return { error: e.message };
    }
  }

  @SubscribeMessage('chat-leave')
  async leave(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: any,
  ) {
    /**data:
    {
      "roomID": number | string,
    }
    */
    try {
      const user = client.user;
      const roomID = data.roomID;
      if (!(await this._chatService.getRoomById(roomID)))
        return { error: 'no such room' };
      await this._chatService.removeMemberFromRoom(roomID, user.sub);
      this.server
        .to(String(roomID))
        .emit('chat-leave', { name: user.username });
      client.leave(String(roomID));
      return { roomID };
    } catch (e) {
      return { error: e.message };
    }
    /** out:
    {
      "roomID": number,
    }
    error:
    {
      "error": string,
    }
     */
  }

  @SubscribeMessage('chat-room-invite')
  async roomInvite(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: any,
  ) {
    // this is the input data
    /** data:
     {
         "uid": number | string,
         "roomID": string,
         "timestamp": Date
     } 
     */
    try {
      // first thing to do is destruct the username and the room id from the data object
      const { name, roomID } = data;
      // now lets check if we have a user with such name in the data base
      const user = await this._chatService._userService.findByUserName(name);
      if (!user) return { error: 'no such user' };
      // the same for room we need to check if we have a room with such id in the data base
      const room = await this._chatService.getRoomById(roomID);
      if (!room) return { error: 'no such room' };
      // here we will create a member in this room
      await this._chatService.createMember({
        user,
        roomID,
        userID: user.id,
        password: room.password,
        role: 'member',
      });
      // we need to join the the user to the socket server in he is on-line
      const otherUserClient = await this.server
        .in(Clients.getSocketId(user.id).socketId)
        .fetchSockets(); // this method gives us all the connected socket to the server
      if (otherUserClient.length) otherUserClient[0].join(String(roomID));
    } catch (e) {
      return { error: e.message };
    }
  }

  @SubscribeMessage('chat-conversation')
  async DM(@ConnectedSocket() client: CustomSocket, @MessageBody() data: any) {
    // the first thing to do is destcrut the other user from the payload
    const { otherUser } = data;
    // now lets check if we have this user in the data base and create the DM
    let newDM: RoomEntity;
    try {
      let oUser = await this._chatService._userService.findById(otherUser);
      let curUser = await this._chatService._userService.findById(
        client.user.sub,
      );
      if (!oUser || !curUser) return { error: 'no such user' };
      newDM = await this._chatService.createDM(
        {
          isChannel: false,
          channelType: 'private',
          name: `DM${client.user.sub}${otherUser}`,
        },
        { userID1: client.user.sub, userID2: otherUser },
      );
      // after the DM is created we need to join the user to it
      const otherUserClient = await this.server
        .in(Clients.getSocketId(otherUser).socketId)
        .fetchSockets();
      newDM.name = oUser.username;
      let otherChat = {
        ...newDM,
        users: oUser
          ? { uid: oUser.id, name: oUser.username, img: oUser.avatar, status: Clients.getUserStatus(oUser.id) }
          : undefined,
      };
      newDM.name = curUser.username;
      let curChat = {
        ...newDM,
        users: curUser
          ? { uid: curUser.id, name: curUser.username, img: curUser.avatar, status: Clients.getUserStatus(curUser.id) }
          : undefined,
      };
      if (otherUserClient.length) {
        otherUserClient[0].emit('newDirectMessage', curChat);
        otherUserClient[0].join(String(newDM.roomID));
      }
      client.join(String(newDM.roomID));
      return otherChat;
    } catch (e) {
      return { error: e.message };
    }
  }

  @SubscribeMessage('ban')
  async banMember(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: any,
  ) {
    // userID is the id of the user to ban
    const { roomID, userID } = data;
    try {
      const member = await this._chatService.getMember({
        userID: client.user.sub,
        roomID,
      });
      if (!member) return { error: 'no such member' };
      if (member.role !== 'admin') return { error: 'you are not the admin' };

      const room = await this._chatService.getRoomById(roomID);
      if (!room) return { error: 'no such room' };
      if (room.ownerID === userID)
        return { error: "you can't ban the room owner" };
      await this._chatService.banMember(roomID, userID);
      // after the user is stored in the DB as banned we need to leave it from the room
      this.server.to(String(roomID)).emit('ban', { roomID, userID });
      const otherUserClient = await this.server
        .in(Clients.getSocketId(userID).socketId)
        .fetchSockets();
      if (otherUserClient.length) otherUserClient[0].leave(String(roomID));
    } catch (e) {
      return { error: e.message };
    }
  }

  @SubscribeMessage('mute')
  async muteMember(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: any,
  ) {
    // first thing we need to destruct the userID, timeout and the roomID from the socket payload { userID: the user to mute, timeout: the time before we can unmute it}
    const { userID, timeout, roomID } = data;
    if (timeout > 2147483647)
      return { error: 'ghyrha ghyrha bghiti tkhsr hadchi' };
    try {
      const member = await this._chatService.getMember({
        userID: client.user.sub,
        roomID,
      });
      if (!member) return { error: 'no such member' };
      if (member.role !== 'admin') return { error: 'you are not the admin' };

      const room = await this._chatService.getRoomById(roomID);
      if (!room) return { error: 'no such room' };
      if (room.ownerID === userID)
        return { error: "you can't mute the room owner" };
      await this._chatService.muteMember(roomID, userID);
      // here we set a timeout to unmute the user
      const time = setTimeout(() => {
        this._chatService.unmuteMember(roomID, userID);
        this.server.to(String(roomID)).emit('unmute', { roomID, userID });
      }, timeout);
      this._chatService.timers.set(`${userID}-${roomID}`, time);
    } catch (e) {
      return { error: e.message };
    }
    this.server.to(String(roomID)).emit('mute', { roomID, userID });
  }

  @SubscribeMessage('unmute')
  async unmuteMember(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: any,
  ) {
    const { roomID, uid } = data;
    try {
      if (!(await this._chatService.getRoomById(roomID)))
        return { error: 'no such room' };
      await this._chatService.unmuteMember(roomID, uid);
    } catch (e) {
      return { error: e.message };
    }
    this.server.to(String(roomID)).emit('unmute', { roomID, uid });
  }

  @SubscribeMessage('unban')
  async unbanMember(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() data: any,
  ) {
    const { roomID, uid } = data;
    try {
      if (!(await this._chatService.getRoomById(roomID)))
        return { error: 'no such room' };
      await this._chatService.unbanMember(roomID, uid);
    } catch (e) {
      return { error: e.message };
    }
    this.server.to(String(roomID)).emit('unban', { roomID, uid });
  }
}
