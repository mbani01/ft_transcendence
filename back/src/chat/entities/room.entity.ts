import { User } from "src/users/entity/user.entity";
import { UsersController } from "src/users/users.controller";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChannelType } from "../common/chat.types";
import { MembersEntity } from "./members.entity";

@Entity('room') // crate a table named rooms.
export class RoomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, nullable: false})
    name: string;

    @Column({ default: false, nullable: false})
    isChannel: boolean;

    @Column({nullable: false})
    ownerId: number;

    @Column({nullable: false})
    channelType: ChannelType;

    @Column({ default: '' })
    password: string;

    // @OneToMany(() => MembersEntity, member => member.room)
    // public memberShip!: MembersEntity[];
    
    // @OneToMany(() => MembersEntity, member => member.room)
    // public messages!: MembersEntity[];

}
