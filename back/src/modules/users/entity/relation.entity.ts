import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./user.entity";

@Entity('Relations')
export class Relation
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false , nullable: false})
    isFriends: boolean;

    @ManyToOne(() => User, user => user.relationsFirst)
    @JoinColumn()
    userFirst: User;

    @ManyToOne(() => User, user => user.relationsSecond)
    @JoinColumn()
    userSecond: User;
    
    @ManyToOne(() => User, user => user.BlockedRelations)
    @JoinColumn()
    blocker: User;

    @ManyToOne(() => User, user => user.FriendshipRequests)
    @JoinColumn()
    requester: User;

}