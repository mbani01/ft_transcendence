import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateUserDto {
  username: string;

  avatar: string;

  email: string;

  friendID?: number;
}
