import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ChannelType } from "../common/chat.types";

export class CreateRoomBodyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    isPublic: boolean;

    @IsString()
    @IsOptional()
    @MinLength(8)
    @MaxLength(15)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    password: string

    @IsBoolean()
    isChannel: boolean;

}

export class CreateRoomDto {
    ownerId: number;
    name: string;
    isChannel: boolean;
    channelType: ChannelType;
    password: string;
}

