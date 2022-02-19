import { IsNumber, IsOptional, IsPositive, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { Roles } from "../common/chat.types";

export class CreateMemberDto{
    @IsNumber()
    @IsPositive()
    roomID: number;

    @IsString()
    @IsOptional()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    password: string
}

export class CreateMemberColumn{
    userID: number;
    roomID: number;
    password: string;
    role: Roles;
}