import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class getUserQueryDto {
    @IsString()
    @IsNotEmpty()
    like: string;
    
    @IsNumber()
    @IsNotEmpty() 
    limit: number;
}