import { User } from "src/modules/users/entity/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { CreateDateColumn,UpdateDateColumn } from "typeorm";

@Entity('Games')
export class Game
{
    @PrimaryColumn()
    id: string;

    @Column()
    firstPlayerScore: number;

    @Column()
    secondPlayerScore: number;

    @Column("int")
    @ManyToOne(() => User, user => user.gamesAsFirstPlayer)
    @JoinColumn({name: "firstPlayer"})
    public firstPlayer: User;

    @Column("int")
    @ManyToOne(() => User, user => user.gamesAsSecondPlayer)
    @JoinColumn({name : "secondPlayer"})
    public secondPlayer: User;

    @Column("int")
    @ManyToOne(() => User, user => user.wins)
    @JoinColumn({name : "winner"})
    public winner: User;

    @Column()
    isDefault: boolean;
    
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;


}