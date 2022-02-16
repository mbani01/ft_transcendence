import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateRoomBodyDto, CreateRoomDto } from './dto/create-room.dto';
import { GetAllRoomsQueryDto, GetMessageQueryDto, ParamsDto, UnmuteAndUnbanDto } from './dto/params.dto';

@Controller('chat')
export class ChatController {
    constructor(private readonly _chaTService: ChatService) { }

    @Get('messages/:roomID')
    getMessages(@Query() pgQuery: GetMessageQueryDto, @Param() { roomID }: ParamsDto): void {
        const { before } = pgQuery;
        /**
         * [
            {
                "message": string,
                "sender": string,
                "timestamp": Date
            }
            ]
         */
        return this._chaTService.getMessages(before, roomID);
        // return `this opetion witll return the list of last 10 messages with roomId = ${roomID} and timestamp = ${before}`;
    }

    @UseGuards(JwtAuthGuard) // 
    @Get('fetch-rooms')
    getCurrentUserRooms() {
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
        return 'this option will return all the rooms belong to the current user';
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
        const { name, isPublic, password, isChannel } = createRoomBodyDto;
        const channelType = this._chaTService.getChannelType(isPublic, password);
        const roomEntity: CreateRoomDto = { name, password, channelType, ownerId: req.user.id, isChannel }
        return this._chaTService.createRoom(roomEntity);
        /** Response
         * if (err) {
                "error": string
            }
         */
        // return `this option will create a ${channelType} channel named ${name}`;
    }

    @Get('channels')
    getAllRooms(@Query() pgQuery: GetAllRoomsQueryDto) {
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
        return this._chaTService.findAllRooms();
        // return `this action returns all the channels that match the follwing quries: like:${like}, page${page}`;
    }

    @Get('members/:roomID')
    getRoomUsers(@Param() roomId: ParamsDto) {
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

        return `return all the users in the room with id #${roomId}`;
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
