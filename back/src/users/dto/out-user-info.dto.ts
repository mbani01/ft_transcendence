import { IsNumber } from "class-validator";

export class OutUserInfoDto {
    @IsNumber()
    games: number;

    @IsNumber()
    wins: number;

    @IsNumber()
    rankPoints: number;

    @IsNumber()
    totalScore: number;
}

