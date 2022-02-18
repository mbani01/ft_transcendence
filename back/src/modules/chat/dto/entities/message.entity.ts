import { IsDateString } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { RoomEntity } from "./room.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    userId: number;

    @Column({ nullable: false })
    roomId: number;

    @Column({ nullable: false })
    content: string;

    @CreateDateColumn({ nullable: false })
    createdAt: Date;

    // @ManyToOne(() => User, user => user.messages)
    // public user!: User;

    // @ManyToOne(() => RoomEntity, room => room.messages)
    // public room!: RoomEntity;
}
