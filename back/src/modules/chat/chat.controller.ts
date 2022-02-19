import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { check } from 'prettier';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateRoomBodyDto, CreateRoomDto } from './dto/create-room.dto';
import { GetAllRoomsQueryDto, GetMessageQueryDto, ParamsDto, UnmuteAndUnbanDto } from './dto/params.dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly _chaTService: ChatService) { }

    @Get('messages/:roomID')
    async getMessages(@Param() { roomID }: ParamsDto) {
        /**
         * [
            {
                "message": string,
                "sender": string,
                "timestamp": Date
            }
            ]
         */
        return await this._chaTService.getMessages(roomID);
        // return `this opetion witll return the list of last 10 messages with roomId = ${roomID} and timestamp = ${before}`;
    }

    @UseGuards(JwtAuthGuard) // 
    @Get('fetch-rooms')
    getCurrentUserRooms(@Req() req) {
        /**
         * [
                {
                  "roomID": number | string,
                  "name": string,           // name of the room
                  "isChannel": boolean,     // true if the room is a channel false if it's a dm
                  "type": number;           // private, protected or public
                }
            ]
         */
        return this._chaTService.fetchCurrentUserRooms(req.user);
        // return 'this option will return all the rooms belong to the current user';
    }

    @UseGuards(JwtAuthGuard)
    @Post('create-channel')
    createChannel(@Body() createRoomBodyDto: CreateRoomBodyDto, @Req() req) {
        /** Request
         *  {
              "name": string, // channel's name
              "isPublic": boolean,
              "password"?: string
            }
         */
        const { name, isPublic, password } = createRoomBodyDto;
        const channelType = this._chaTService.getChannelType(isPublic, password);
        const roomEntity: CreateRoomDto = { name, password, channelType, ownerID: req.user.id }
        return this._chaTService.createRoom(roomEntity);
        /** Response
         * if (err) {
                "error": string
            }
         */
        // return `this option will create a ${channelType} channel named ${name}`;
    }

    @UseGuards(JwtAuthGuard)
    @Get('channels')
    async getAllRooms(@Query() pgQuery: GetAllRoomsQueryDto, @Req() req) {
        const { like, page } = pgQuery;

        /** returns an object with the following properties: 
         * {
            "channels": [
                {
                  "roomID": number | string,
                  "name": string,
                  "type": number,
                  "owner": {
                    "uid": number | string,
                    "name": string,
                    "img": string
                  }
                }
            ],
            "collectionSize": number
            }
        */
        const rooms = await this._chaTService.findAllRooms();
        console.log(rooms);
        let channels = [];
        rooms.forEach(e => {
            channels.push(
                {
                    roomID: e.roomID,
                    name: e.name,
                    type: e.channelType,
                    owner: {
                        uid: req.user.id,
                        name: req.user.username,
                        img: req.user.avatar
                    }
                })
        })
        return {channels, collectionSize: channels.length};
    }

    @UseGuards(JwtAuthGuard)
    @Get('members/:roomID')
    getRoomUsers(@Param() { roomID }: ParamsDto, @Req() req) {
        /**
         * returns the following object.
        [
            {
              "uid": number | string,
              "name": string,
              "img": string
            }
        ]
         */
        return this._chaTService.findAllMembers(roomID, req.user.id);
        // return `return all the users in the room with id #${roomId}`;
    }

    @Post('/:roomID/unmute/:uid')
    unmuteMember(@Param() params: UnmuteAndUnbanDto) {
        console.log(params);
        const { roomID, uid } = params;
        return `this action will unmute the user with id #${uid} from room with id #${roomID}`;
    }

    @Post('/:roomID/unban/:uid')
    unbanMember(@Param() params: UnmuteAndUnbanDto) {
        const { roomID, uid } = params;
        return `this action will unban the user with id #${uid} from room with id #${roomID}`;
    }
}
