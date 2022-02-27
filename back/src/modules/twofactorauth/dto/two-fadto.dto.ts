import { IsNotEmpty, IsString } from "class-validator";

export class TwoFACodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
