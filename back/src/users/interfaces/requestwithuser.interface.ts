import { User } from "../entity/user.entity";
import { Request } from "express";

export interface RequestWithUser extends Request {
  user: User;
}
