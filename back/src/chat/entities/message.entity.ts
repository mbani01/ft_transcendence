import { IsDateString } from "class-validator";
import { User } from "src/users/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { RoomEntity } from "./room.entity";
import { CreateDateColumn,UpdateDateColumn } from "typeorm";

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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @ManyToOne(() => User, user => user.messages)
    public user!: User;

    @ManyToOne(() => RoomEntity, room => room.messages)
    public room!: RoomEntity;

    @ManyToOne(() => User, user => user.challanges)
    challangedUser: User;
}
