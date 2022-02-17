import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io'
import { CreateMessageColumnDto, CreateMessageDto } from './dto/create-message.dto';
import { CreateMemberColumn, CreateMemberDto } from './dto/create-member.dto';
import { Clients, CustomSocket } from 'src/adapters/socket.adapter';

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
    client.emit('message', 'Welcome to Chat!');
    console.log(`client with id #${client.id} connected`)
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('hmad')
  async message(@MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: CustomSocket) {
    // console.log("data ====", data);
    console.log("data");
    const { roomID: roomId, timestamp: createdAt, message: content } = data;
    const userId = Clients.getUserId(client.id);
    const message: CreateMessageColumnDto = { roomId, createdAt, content, userId: +userId }
    await this._chatService.createMessage(message);
    const room = await this._chatService.getRoomById(roomId);
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
    client.broadcast.to(room.name).emit('message', outData);
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: CustomSocket, @MessageBody() createMemberDto: CreateMemberDto) {
    const { roomID, password } = createMemberDto;
    const userId = Clients.getUserId(client.id);
    const member: CreateMemberColumn = {
      roomID,
      userID: +userId,
      password,
      role: 'member'
    };
    await this._chatService.createMember(member);
    const room = await this._chatService.getRoomById(roomID);
    client.broadcast.to(room.name).emit('join', {name: client.user.username, timestamp: Date.now});
  }
}
