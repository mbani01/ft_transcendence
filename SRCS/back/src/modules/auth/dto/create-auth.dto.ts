import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAuthPaginationDto {
    @IsString()
    @IsNotEmpty()
    code:string;
    @IsString()
    @IsOptional()
    twoFactorAuth: string;
}
