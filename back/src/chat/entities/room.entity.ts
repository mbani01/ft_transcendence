import { User } from "src/users/entity/user.entity";
import { UsersController } from "src/users/users.controller";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChannelType } from "../common/chat.types";
import { MembersEntity } from "./members.entity";
import { CreateDateColumn,UpdateDateColumn } from "typeorm";

@Entity('room') // crate a table named rooms.
export class RoomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @Column({ default: false })
    isChannel: boolean;

    @Column()
    ownerId: number;

    @Column()
    channelType: ChannelType;

    @Column({ default: '' })
    password: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @OneToMany(() => MembersEntity, member => member.room)
    public memberShip!: MembersEntity[];
    
    @OneToMany(() => MembersEntity, member => member.room)
    public messages!: MembersEntity[];

}
