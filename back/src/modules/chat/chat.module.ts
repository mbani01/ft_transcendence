import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './dto/entities/room.entity';
import { MessageEntity } from './dto/entities/message.entity';
import { MembersEntity } from './dto/entities/members.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity, MessageEntity, MembersEntity])],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController]
})
export class ChatModule { }
