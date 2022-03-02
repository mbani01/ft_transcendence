import { IsNumber, IsString } from "class-validator";

export class OutUserDto {
    @IsNumber()
    uid: number;
    @IsString()
    name: string;
    @IsString()
    img: string;
}
