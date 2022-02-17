import { Column, Entity, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { CreateDateColumn,UpdateDateColumn } from "typeorm";

@Entity('Games')
export class Game
{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstPlayerScore: number;

    @Column()
    secondPlayerScore: number;

    @ManyToOne(() => User, user => user.gamesAsFirstPlayer)
    firstPlayer: User;

    @ManyToOne(() => User, user => user.gamesAsSecondPlayer)
    secondPlayer: User;

    @ManyToOne(() => User, user => user.wins)
    winner: User;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

}
