import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChannelType } from "../common/chat.types";

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
}
