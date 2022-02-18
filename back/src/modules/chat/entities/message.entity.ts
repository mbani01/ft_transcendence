import { IsDateString } from "class-validator";
import { User } from "src/modules/users/entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RoomEntity } from "./room.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false }) // also this is the mesage sender.
    userId: number;

    @Column({ nullable: false })
    roomId: number;

    @Column({ nullable: false })
    content: string;

    @CreateDateColumn({ nullable: false })
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
