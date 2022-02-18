import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { ChannelType } from './common/chat.types';
import { CreateMemberColumn } from './dto/create-member.dto';
import { CreateMessageColumnDto, CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { MembersEntity } from './entities/members.entity';
import { MessageEntity } from './entities/message.entity';
import { RoomEntity } from './entities/room.entity';

@Injectable()
export class ChatService {

  constructor(@InjectRepository(RoomEntity) private readonly _roomsRepo: Repository<RoomEntity>,
    @InjectRepository(MessageEntity) private readonly _messagesRepo: Repository<MessageEntity>,
    @InjectRepository(MembersEntity) private readonly _membersRepo: Repository<MembersEntity>,) { }


  async createRoom(createRoomDto: CreateRoomDto) {
    const { name } = createRoomDto;
    const room = await this._roomsRepo.findOne({ name: name })
    if (room) throw new UnauthorizedException('room already exist!');

    const newRoom = this._roomsRepo.create(createRoomDto);
    return await this._roomsRepo.save(newRoom);
  }

  async createMessage(message: CreateMessageColumnDto) {
    const newMessage = this._membersRepo.create(message);
    return await this._messagesRepo.save(newMessage);
  }

  async createMember(newMember: CreateMemberColumn)
  {
    let member = await this.getMemberByQuery(newMember);
    if (member.length !== 0) throw new UnauthorizedException(`member already joined`);
    const room = await this.getRoomById(newMember.roomID);
    if (!room) throw new NotFoundException(`no such room`);
    if (room.channelType === 'protected')
    {
        if (newMember.password !== room.password)
          throw new UnauthorizedException('Wrong password');
    }
    delete newMember.password;
    const createdMember = this._membersRepo.create(newMember);
    return await this._membersRepo.save(createdMember);
  }

  async findAllRooms() {
    return await this._roomsRepo.find();
  }

  async getRoomById(id: number) {
    return await this._roomsRepo.findOne({ id })
  }

  async getMemberByQuery(member: CreateMemberColumn)
  {
    return await this._membersRepo.find({ where: {userId: member.userID, roomId: member.roomID} });
  }

  getMessages(before: string, roomId: number) {
    this._messagesRepo.find({ roomId, })
  }

  getChannelType(isPublic: boolean, password: string): ChannelType {
    console.log(password)
    if (isPublic)
      return "public";
    else if (!isPublic && !!password)
      return "protected";
    return "private";
  }
}
