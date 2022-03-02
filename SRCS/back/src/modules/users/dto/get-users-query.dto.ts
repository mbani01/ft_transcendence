import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class getUserQueryDto {
    @IsString()
    like: string;
    
    @IsNumber()
    @IsNotEmpty() 
    limit: number;
}