import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { MessageEntity } from './entities/message.entity';
import { MembersEntity } from './entities/members.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity, MessageEntity, MembersEntity])],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController]
})
export class ChatModule { }
