import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { MessageEntity } from './entities/message.entity';
import { MembersEntity } from './entities/members.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entity/user.entity';
import { Relation } from '../users/entity/relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity, MessageEntity, MembersEntity, User, Relation])],
  providers: [ChatGateway, ChatService, UsersService],
  controllers: [ChatController]
})
export class ChatModule { }
