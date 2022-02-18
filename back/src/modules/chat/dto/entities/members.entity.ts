import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "../../common/chat.types";
import { RoomEntity } from "./room.entity";

@Entity('member')
export class MembersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    userId: number;

    @Column({ nullable: false })
    roomId: number;

    @Column({ default: 'member', nullable: false })
    role: Roles;

    // @ManyToOne(() => User, user => user.memberShip)
    // public user!: User;

    // @ManyToOne(() => RoomEntity, room => room.memberShip)
    // public room!: RoomEntity;

}
