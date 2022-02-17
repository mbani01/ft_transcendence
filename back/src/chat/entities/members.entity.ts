import { User } from "src/users/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "../common/chat.types";
import { RoomEntity } from "./room.entity";
import { CreateDateColumn,UpdateDateColumn } from "typeorm";

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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @ManyToOne(() => User, user => user.memberShip)
    public user!: User;

    @ManyToOne(() => RoomEntity, room => room.memberShip)
    public room!: RoomEntity;

}
