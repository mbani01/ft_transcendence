import { IsNumber, IsString } from "class-validator";

export class UpdateUserNameDto {
    @IsString()
    name: string;
}

export class UpdateUserAvatarDto {
    @IsString()
    img: string;
}