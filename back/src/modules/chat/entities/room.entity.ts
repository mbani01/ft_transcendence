import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChannelType } from "../common/chat.types";
import { MembersEntity } from "./members.entity";

@Entity('room') // crate a table named rooms.
export class RoomEntity {
    @PrimaryGeneratedColumn()
    roomID: number;

    @Column({unique: true})
    name: string;

    @Column({ default: true})
    isChannel: boolean;

    @Column({nullable: true})
    ownerID: number;

    @Column({nullable: false})
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
