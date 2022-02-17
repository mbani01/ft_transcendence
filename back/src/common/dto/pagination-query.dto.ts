import { Type } from "class-transformer";
import { IsOptional, IsPositive } from "class-validator";

export class PaginationQueryDto {
  @IsOptional()
  like: string;

  @IsOptional()
  @IsPositive()
  limit: number;
}
