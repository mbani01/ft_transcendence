import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { ChatService } from './chat.service';
import { GetAllRoomsQueryDto, ParamsDto, UnmuteAndUnbanDto } from './dto/params.dto';
import {WebSocketServer} from "@nestjs/websockets";
import {Server} from "socket.io";
import {Clients} from "../../adapters/socket.adapter";
import {createJwtProvider} from "@nestjs/jwt/dist/jwt.providers";

@Controller('chat')
export class ChatController {
    constructor(private readonly _chaTService: ChatService,
        private readonly _usersService: UsersService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('messages/:roomID')
    async getMessages(@Param() { roomID }: ParamsDto, @Req() req: any) {
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
        return await this._chaTService.getMessages(roomID, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:roomID/role/:uid')
    async getMyRole(@Param() params: any, @Req() req: any)
    {
        const {roomID, uid} = params;
        try {
            const member = await  this._chaTService.getMember({roomID, userID: uid});
            return { role: member.role };
        } catch (e)
        {
            return { error: e.message };
        }
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
            const currMember = await this._chaTService.getMember({ userID: req.user.id, roomID: e.roomID });
            console.log(currMember);
            if (e.isChannel && e.channelType !== 'private' && (!currMember || !currMember.isBaned)) {
                const owner = await this._usersService.findById(e.ownerID);
                channels.push(
                    {
                        roomID: e.roomID,
                        name: e.name,
                        type: e.channelType,
                        owner: {
                            uid: e.ownerID,
                            name: owner.username,
                            img: owner.avatar
                        }
                    })
            }
        }
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

    // @UseGuards(JwtAuthGuard)
    // @Patch('/:roomID/unmute/:uid')
    // async unmuteMember(@Param() params: UnmuteAndUnbanDto, @Req() req) {
    //     const { roomID, uid } = params;
    //     try {
    //     await  this._chaTService.unmuteMember(roomID, uid, req.user);
    //     } catch (e) {
    //         return {error: e.message };
    //     }
    //     return {roomID, uid};
    // }
    //
    // @UseGuards(JwtAuthGuard)
    // @Patch('/:roomID/unban/:uid')
    // async unbanMember(@Param() params: UnmuteAndUnbanDto, @Req() req) {
    //     const { roomID, uid } = params;
    //     try {
    //     await this._chaTService.unbanMember(roomID, uid, req.user);
    //     } catch (e) {
    //         return {error: e.message };
    //     }
    //     return {roomID, uid};
    // }

    // @UseGuards(JwtAuthGuard)
    // @Patch('/:roomID/ban')
    // async banMemeber(@Param('roomID') roomID: number, @Body('userID') userID: number, @Req() req) { // userID is the id of the user to ban
    //     const user: User = req.user;
    //     try {
    //         await this._chaTService.banMember(roomID, userID, user);
    //     } catch (e) {
    //         return { error: e.message };
    //     }
    //     return { userID };
    // }

    // @UseGuards(JwtAuthGuard)
    // @Patch('/:roomID/mute')
    // async muteMemeber(@Param('roomID') roomID: number, @Body() body: any, @Req() req) { // userID is the id of the user to ban
    //     const user: User = req.user;
    //     const {userID, timeout} = body;
    //     try {
    //         await this._chaTService.muteMember(roomID, userID, user);
    //         const time = setTimeout(this._chaTService.unmuteMember.bind(this._chaTService), timeout, roomID, userID, user);
    //         this._chaTService.timers.set(`${userID}-${roomID}`, time);
    //     } catch (e) {
    //         return {error: e.message};
    //     }
    //     return {userID};
    // }

    @UseGuards(JwtAuthGuard)
    @Patch('/:roomID/update-name')
    async updateRoomName(@Param('roomID') roomID: number, @Body('name') newRoomName: string) {
        try {
            await this._chaTService.updateRoomName(roomID, newRoomName);
        }
        catch (e) {
            return { error: e.message };
        }
        return { name: newRoomName };
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/:roomID/update-password')
    async updateRoomPassword(@Param('roomID') roomID: number, @Body('password') newRoomPassword: string) {
        try {
            await this._chaTService.updateRoomPassword(roomID, newRoomPassword);
        }
        catch (e) {
            return { error: e.message };
        }
        return { roomID };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:roomID/mutes')
    async getMutedMembers(@Param('roomID') roomID: number) {
        try {
            return await this._chaTService.getMutedMembers(roomID);
        }
        catch (e) {
            return { error: e.message };
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:roomID/bans')
    async getBanedMembers(@Param('roomID') roomID: number) {
        try {
            return await this._chaTService.getBannedMembers(roomID);
        }
        catch (e) {
            return { error: e.message };
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/:roomID/give-admin')
    async giveAdmin(@Param('roomID') roomID: number, @Body('userID') userID: number, @Req() req) {
        const user: User = req.user;
        try {
            await this._chaTService.makeAdmin(roomID, userID, user);
        } catch (e) {
            return { error: e.message };
        }
        return { userID };
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/:roomID/revoke-admin')
    async revokeAdmin(@Param('roomID') roomID: number, @Body('userID') userID: number, @Req() req) {
        const user: User = req.user;
        try {
            await this._chaTService.revokeAdmin(roomID, userID, user);
        } catch (e) {
            return { error: e.message };
        }
        return { userID };
    }
}
