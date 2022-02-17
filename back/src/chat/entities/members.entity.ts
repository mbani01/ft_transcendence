import { User } from "src/users/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "../common/chat.types";
import { RoomEntity } from "./room.entity";

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

    @ManyToOne(() => User, user => user.memberShip)
    public user!: User;

    @ManyToOne(() => RoomEntity, room => room.memberShip)
    public room!: RoomEntity;

}
