import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  avatar: string;

  @IsEmail()
  email: string;

  // @IsString()
  // token: string;
}
