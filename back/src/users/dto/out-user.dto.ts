import { IsNumber, IsString } from "class-validator";

export class OutUserDto {
    @IsNumber()
    userId: number;
    @IsString()
    username: string;
    @IsString()
    avatar: string;
}
