import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { CreateDateColumn } from "typeorm";

export class CreateMessageDto {
    @IsNumber()
    @IsPositive()
    roomID: number;

    @IsString()
    @IsNotEmpty()
    message: string;

    @CreateDateColumn()
    timestamp: Date;
}

export class CreateMessageColumnDto {
    userId: number;

    roomId: number;

    content: string;

    createdAt: Date;
}