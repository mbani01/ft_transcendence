import { User } from "src/modules/users/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
    public firstPlayer: User;

    @ManyToOne(() => User, user => user.gamesAsSecondPlayer)
    public secondPlayer: User;

    @ManyToOne(() => User, user => user.wins)
    winner: User;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

}