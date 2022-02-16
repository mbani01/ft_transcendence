import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "../common/chat.types";

@Entity('member')
export class MembersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    roomId: number;

    @Column({ default: 'member' })
    role: Roles;
}
