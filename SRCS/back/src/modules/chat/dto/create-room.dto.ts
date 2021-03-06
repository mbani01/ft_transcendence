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
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    password: string
}

export class CreateRoomDto {
    ownerID: number;
    name: string;
    channelType: ChannelType;
    password: string;
}

