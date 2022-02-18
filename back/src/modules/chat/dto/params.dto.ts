import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ParamsDto {
    @IsNumber()
    @IsPositive()
    roomID: number;
}

export class UnmuteAndUnbanDto {
    @IsNumber()
    @IsPositive()
    roomID: number;

    @IsNumber()
    @IsPositive()
    uid: number;
}

export class GetMessageQueryDto {

    @IsString()
    @IsNotEmpty()
    before: string;
}
export class GetAllRoomsQueryDto {
    @IsString()
    @IsNotEmpty()
    like: string;

    @IsNumber()
    @IsPositive()
    page: number;
}
