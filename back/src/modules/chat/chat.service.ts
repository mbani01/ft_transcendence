import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ChannelType } from './common/chat.types';
import { CreateDMDto } from './dto/create-dm.dto';
import { CreateMemberColumn } from './dto/create-member.dto';
import { CreateMessageColumnDto } from './dto/create-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { MembersEntity } from './entities/members.entity';
import { MessageEntity } from './entities/message.entity';
import { RoomEntity } from './entities/room.entity';
import {Not} from "typeorm";

@Injectable()
export class ChatService {

  constructor(@InjectRepository(RoomEntity) private readonly _roomsRepo: Repository<RoomEntity>,
    @InjectRepository(MessageEntity) private readonly _messagesRepo: Repository<MessageEntity>,
    @InjectRepository(MembersEntity) private readonly _membersRepo: Repository<MembersEntity>,
    public readonly _userService: UsersService) { }


  async createRoom(createRoomDto: CreateRoomDto) {
    const { name } = createRoomDto;
    const room = await this._roomsRepo.findOne({ name: name })
    if (room) throw new UnauthorizedException('room already exist!');

    const newRoom = this._roomsRepo.create(createRoomDto);
    await this._roomsRepo.save(newRoom);
    return newRoom;
  }

  async createMessage(message: CreateMessageColumnDto) {
    const newMessage = this._messagesRepo.create(message);
    return await this._messagesRepo.save(newMessage);
  }

  async createMember(newMember: CreateMemberColumn) {
    let member = await this.getMemberByQuery(newMember.userID, newMember.roomID);
    if (member.length !== 0) throw new UnauthorizedException('member already joined');
    const room = await this.getRoomById(newMember.roomID);
    if (!room) throw new NotFoundException(`no such room`);
    if (room.channelType === 'protected') {
      if (newMember.password !== room.password)
        throw new UnauthorizedException('Wrong password');
    }
    delete newMember.password;
    const createdMember = this._membersRepo.create(newMember);
    createdMember.roomID = newMember.roomID;
    createdMember.userID = newMember.userID;
    return await this._membersRepo.save(createdMember);
  }

  async removeMemberFromRoom(roomID: number, userID: number) {
    return await this._membersRepo.delete({ roomID, userID });
  }

  async findAllRooms() {
    return await this._roomsRepo.find();
  }

  async getRoomById(roomID: number) {
    return await this._roomsRepo.findOne({ roomID })
  }

  async getRoomByUid(uid: number) {
    return await this._membersRepo.find({
      where: {
        userID: uid
      }
    })
  }

  async getMemberByQuery(userID: number, roomID: number) {
    return await this._membersRepo.find({ where: { userID, roomID } });
  }

  async getMessages(roomId: number) {
    const res = []; // res to store inof about returned object
    const messages = await this._messagesRepo.find({ roomID: roomId })
    for (let message of messages) {
      const user = await this._userService.findById(message.userID);
      res.push({
        message: message.content,
        sender: {
          uid: user.id,
          name: user.username,
          img: user.avatar
        },
        timestamp: message.createdAt
      })
    }
    return res;
  }

  async findAllMembers(roomId: number, userID: number) {
    const res = []; // res to store users info
    const members = await this._membersRepo.find({
      where: {
        roomID: roomId
      }
    });
    for (let member of members)
      res.push(await this._userService.findById(member.userID));
    console.log(res);
    return res;
  }

  async fetchCurrentUserRooms(user: any) {
    const res = []; // res to store rooms info
    const members = await this._membersRepo.find({
      where: {
        userID: user.id
      }
    });
    for (let member of members) {
      const room = await this._roomsRepo.find({
        where: {
          roomID: member.roomID
        }
      })
      let otherUser;
      if (!room[0].isChannel)
      {
          let otherMember = await  this._membersRepo.find({
            where: {
                roomID: room[0].roomID,
                userID: Not(member.userID)
            }
          });
          otherUser = await this._userService.findById(otherMember[0].userID);
      }
      res.push({...room[0], users: otherUser ? {uid: otherUser.id, name: otherUser.username, img: otherUser.avatar}:undefined});
    }
    return res;
  }



  async createDM(dm: CreateDMDto, usersIDs: any) {
    // Create a DM.
    const newDM = this._roomsRepo.create(dm);
    await this._roomsRepo.save(newDM);

    // Create the Members that going to join the dm.
    const user1 = await this._userService.findById(usersIDs.userID1);
    const user2 = await this._userService.findById(usersIDs.userID2);
    await this.createMember({ user: user1, userID: usersIDs.userID1, roomID: newDM.roomID, password: newDM.password, role: 'member' });
    await this.createMember({ user: user2, userID: usersIDs.userID2, roomID: newDM.roomID, password: newDM.password, role: 'member' });
    return newDM;
  }

  async fetchCurrentUserDMs(userID1: number, userID2: number) {
    return await this._roomsRepo.find({where: {isChannel: false, name: `DM${userID1}${userID2}`}})
  }

  /**
       userID: number;
    roomID: number;
    password: string;
    role: Roles;
   */



  getChannelType(isPublic: boolean, password: string): ChannelType {
    if (isPublic && password)
      return 'protected';
    else if (isPublic)
      return 'public';
    return 'private';
  }

  async updateRoomName(roomID: number, newRoomName: string)
  {
    const res = await this._roomsRepo.update(roomID, {
      name: newRoomName
    })
    if (!res) throw new NotFoundException('room not found');
  }

  async updateRoomPassword(roomID: number, newRoomPassword: string)
  {
    const res = await this._roomsRepo.update(roomID, {
      password: newRoomPassword
    })
    if (!res) throw new NotFoundException('room not found');
  }

  async getMutedMembers(roomID: number)
  {
    const mutedMembersArray = [];
    const room = await this._roomsRepo.findOne({roomID});
    if (!room) throw new NotFoundException('room not found');
    const mutedMembers = await this._membersRepo.find({
      relations: ['user'],
       where: {
        roomID: roomID,
        isMuted: true
      }
    })
    for (let member of mutedMembers)
    {
      mutedMembersArray.push({
        uid: member.user.id,
        name: member.user.username,
        img: member.user.avatar
      })
    }
    return mutedMembersArray;
  }

  async getBannedMembers(roomID: number)
  {
    const bannedMembersArray = [];
    const room = await this._roomsRepo.findOne({roomID});
    if (!room) throw new NotFoundException('room not found');
    const bannedMembers = await this._membersRepo.find({
      relations: ['user'],
       where: {
        roomID: roomID,
        isBaned: true
      }
    })
    for (let member of bannedMembers)
    {
      bannedMembersArray.push({
        uid: member.user.id,
        name: member.user.username,
        img: member.user.avatar
      })
    }
    return bannedMembersArray;
  }
}
