import { IsDateString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

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
}
