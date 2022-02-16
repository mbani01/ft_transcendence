import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io'
import { CreateMessageColumnDto, CreateMessageDto } from './dto/create-message.dto';
import { BadGatewayException, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateMemberColumn, CreateMemberDto } from './dto/create-member.dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly _chatService: ChatService) { }

  afterInit(server: any) {
    console.log('Gateway Inited')
  }

  handleDisconnect(client: any) {
    console.log('a user disconnected');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`client with id #${client.id} connected`)
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('message')
  async message(@MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket, @Req() req) {
    const { roomID: roomId, timestamp: createdAt, message: content } = data;
    const user = req.user;

    const message: CreateMessageColumnDto = { roomId, createdAt, content, userId: user.id }
    await this._chatService.createMessage(message);
    const room = await this._chatService.getRoomById(roomId);
    const outData = {
      roomID: roomId,
      sender: {
        uid: user.id,
        name: user.username,
        img: user.avatar,
      },
      message: message.content,
      timestamp: message.createdAt,
    };
    client.broadcast.to(room.name).emit('message', outData);
  }
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() createMemberDto: CreateMemberDto, @Req() req) {
    const { roomID, password } = createMemberDto;
    const user = req.user;
    const member: CreateMemberColumn = {
      roomID,
      userID: user.id,
      password,
      role: 'member'
    };
    await this._chatService.createMember(member);
    const room = await this._chatService.getRoomById(roomID);
    client.broadcast.to(room.name).emit('join', {name: user.username});
  }
}
