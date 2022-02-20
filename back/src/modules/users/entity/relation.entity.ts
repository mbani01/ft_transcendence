import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('Relations')
export class Relation
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false , nullable: false})
    isFriends: boolean;

    @ManyToOne(() => User, user => user.relationsFirst)
    userFirst: User;

    @ManyToOne(() => User, user => user.relationsSecond)
    userSecond: User;
    
    @ManyToOne(() => User, user => user.BlockedRelations)
    blocker: User;

    @ManyToOne(() => User, user => user.FriendshipRequests)
    requester: User;

}