import { IsDateString } from "class-validator";
import { User } from "src/users/entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { RoomEntity } from "./room.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    roomId: number;

    @Column({ default: '' })
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    // @ManyToOne(() => User, user => user.messages)
    // public user!: User;

    // @ManyToOne(() => RoomEntity, room => room.messages)
    // public room!: RoomEntity;
}
