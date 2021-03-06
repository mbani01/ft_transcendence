import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import { ChatService } from './chat.service';
import {
  GetAllRoomsQueryDto,
  ParamsDto,
} from './dto/params.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly _chaTService: ChatService,
    private readonly _usersService: UsersService,
  ) {}

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
    try {
      return await this._chaTService.getMessages(roomID, req.user);
    } catch (e) {
      return { error: e.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:roomID/role/:uid')
  async getMyRole(@Param() params: any, @Req() req: any) {
    const { roomID, uid } = params;
    try {
      const member = await this._chaTService.getMember({ roomID, userID: uid });
      return { role: member.role };
    } catch (e) {
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
    try {
      return await this._chaTService.fetchCurrentUserRooms(req.user);
    } catch (e) {
      return { error: e.message };
    }
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
    try {
      const { rooms, len } = await this._chaTService.findAllRooms(
        like ? like : '',
        page,
      );
      let channels = [];
      for (let e of rooms) {
        const currMember = await this._chaTService.getMember({
          userID: req.user.id,
          roomID: e.roomID,
        });
        if (!currMember || !currMember.isBaned) {
          const owner = await this._usersService.findById(e.ownerID);
          channels.push({
            roomID: e.roomID,
            name: e.name,
            type: e.channelType,
            nOfMembers: await this._chaTService.getNumberOfMembersInRoom(e.roomID),
            owner: {
              uid: e.ownerID,
              name: owner.username,
              img: owner.avatar,
            },
          });
        }
      }
      return { channels, collectionSize: len };
    } catch (e) {
      return { error: e.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':roomID/members')
  getRoomUsers(@Param() { roomID }: ParamsDto, @Req() req: any) {
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
    try {
      return this._chaTService.findAllMembers(roomID, req.user.id);
    } catch (e) {
      return { error: e.message };
    }
  }

  // we should validate the name
  @UseGuards(JwtAuthGuard)
  @Patch('/:roomID/update-name')
  async updateRoomName(
    @Param('roomID') roomID: number,
    @Body('name') newRoomName: string,
  ) {
    if (!newRoomName.length || newRoomName.length > 20)
      return { error: 'name should be between 1 and 20' };
    try {
      await this._chaTService.updateRoomName(roomID, newRoomName);
    } catch (e) {
      return { error: e.message };
    }
    return { name: newRoomName };
  }

  // we should validate the password
  @UseGuards(JwtAuthGuard)
  @Patch('/:roomID/update-password')
  async updateRoomPassword(
    @Param('roomID') roomID: number,
    @Body('password') newRoomPassword: string,
  ) {
    if (
      newRoomPassword?.length < 8 ||
      newRoomPassword?.match('^(?=.*[A-Za-z])(?=.*d)[A-Za-zd]{8,}$')
    )
      return { error: 'password too weak' };
    try {
      await this._chaTService.updateRoomPassword(roomID, newRoomPassword);
    } catch (e) {
      return { error: e.message };
    }
    return { roomID };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:roomID/mutes')
  async getMutedMembers(@Param('roomID') roomID: number) {
    try {
      return await this._chaTService.getMutedMembers(roomID);
    } catch (e) {
      return { error: e.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:roomID/bans')
  async getBanedMembers(@Param('roomID') roomID: number) {
    try {
      return await this._chaTService.getBannedMembers(roomID);
    } catch (e) {
      return { error: e.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:roomID/give-admin')
  async giveAdmin(
    @Param('roomID') roomID: number,
    @Body('userID') userID: number,
    @Req() req,
  ) {
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
  async revokeAdmin(
    @Param('roomID') roomID: number,
    @Body('userID') userID: number,
    @Req() req,
  ) {
    const user: User = req.user;
    try {
      await this._chaTService.revokeAdmin(roomID, userID, user);
    } catch (e) {
      return { error: e.message };
    }
    return { userID };
  }
}
