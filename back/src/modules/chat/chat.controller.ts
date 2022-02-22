import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { check } from 'prettier';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { CreateRoomBodyDto, CreateRoomDto } from './dto/create-room.dto';
import { GetAllRoomsQueryDto, GetMessageQueryDto, ParamsDto, UnmuteAndUnbanDto } from './dto/params.dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly _chaTService: ChatService,
        private readonly _usersService: UsersService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('messages/:roomID')
    async getMessages(@Param() { roomID }: ParamsDto) {
        /**
         * [
            {
                "message": string,
                "sender": {
                    "uid",
                    "name",
                    "img"
                },
                "timestamp": Date
            }
            ]
         */
        return await this._chaTService.getMessages(roomID);
    }

    @UseGuards(JwtAuthGuard) // 
    @Get('fetch-rooms')
    async getCurrentUserRooms(@Req() req) {
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
        return await this._chaTService.fetchCurrentUserRooms(req.user);
        // return 'this option will return all the rooms belong to the current user';
    }

    @UseGuards(JwtAuthGuard) // 
    @Get('fetch-dms')
    fetchDMS(@Query() query: any) {
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
        const { id1: userID1, id2: userID2 } = query;
        return this._chaTService.fetchCurrentUserDMs(userID1, userID2);
        // return 'this option will return all the rooms belong to the current user';
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
        let channels = [];
        for (let e of rooms) {
            if (e.isChannel) {
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
            }
        }
        console.log(channels);
        return { channels, collectionSize: channels.length };
    }

    @UseGuards(JwtAuthGuard)
    @Get('dms')
    async getAllDMs() {
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
        let channels = [];
        for (let e of rooms) {
            if (!e.isChannel) {
                channels.push(
                    {
                        roomID: e.roomID,
                        name: e.name,
                        type: e.channelType,
                        // owner: {
                        //     uid: req.user.id,
                        //     name: req.user.username,
                        //     img: req.user.avatar
                        // }
                    })
            }
        }
        return { channels, collectionSize: channels.length };
    }



    @UseGuards(JwtAuthGuard)
    @Get(':roomID/members')
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

    @UseGuards(JwtAuthGuard)
    @Patch('/:roomID/update-name')
    async updateRoomName(@Param('roomID') roomID: number, @Body('name') newRoomName: string)
    {
        try{
            await this._chaTService.updateRoomName(roomID, newRoomName);
        }
        catch(e)
        {
            return {error: e.message};
        }
        return { name: newRoomName } ;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/:roomID/update-password')
    async updateRoomPassword(@Param('roomID') roomID: number, @Body('password') newRoomPassword: string)
    {
        try{
            await this._chaTService.updateRoomPassword(roomID, newRoomPassword);
        }
        catch(e)
        {
            return {error: e.message};
        }
        return { roomID } ;
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:roomID/mutes')
    async getMutedMembers(@Param('roomID') roomID: number)
    {
        try{
            return await this._chaTService.getMutedMembers(roomID);
        }
        catch(e)
        {
            return { error: e.message };
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:roomID/bans')
    async getBanedMembers(@Param('roomID') roomID: number)
    {
        try{
            return await this._chaTService.getBannedMembers(roomID);
        }
        catch(e)
        {
            return { error: e.message };
        }
    }
}
