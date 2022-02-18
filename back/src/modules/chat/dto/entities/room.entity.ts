import { User } from "src/modules/users/entity/user.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChannelType } from "../../common/chat.types";
import { MembersEntity } from "./members.entity";

@Entity('room') // crate a table named rooms.
export class RoomEntity {
    @PrimaryGeneratedColumn()
    roomID: number;

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
