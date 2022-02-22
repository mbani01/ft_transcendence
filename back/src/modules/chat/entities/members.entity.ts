import { User } from "src/modules/users/entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Roles } from "../common/chat.types";
import { RoomEntity } from "./room.entity";

@Entity('member')
export class MembersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userID: number;

    @Column({ nullable: false })
    roomID: number;

    @Column({ default: 'member', nullable: false })
    role: Roles;

    @Column({nullable: true, default: false})
    isMuted: boolean;

    @Column({nullable: true, default: false})
    isBaned: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @ManyToOne(() => User, user => user.memberShip)
    public user!: User;

    @ManyToOne(() => RoomEntity, room => room.memberShip)
    public room!: RoomEntity;
}
