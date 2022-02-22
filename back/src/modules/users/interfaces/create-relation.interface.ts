import { OneToMany } from "typeorm";
import { User } from "../entity/user.entity";

export interface ICreateRelation {
    isFriends: boolean; // false -> 

    userFirst: User; // Current User.

    userSecond: User; // User who gonna have a relation with current User.

    blocker: User; // the ID of the user to commit a block.

    requester: User; // ID of the user to request friendship.
}


export interface IUpdateRelation {
    isFriends: boolean;
    userFirst: User;
    userSecond: User;
}
export interface IDeleteRelation {
    userFirst: User;
    userSecond: User;
    requester: User;
}