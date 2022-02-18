import { MembersEntity } from 'src/chat/entities/members.entity';
import { Game } from './game.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CreateDateColumn,UpdateDateColumn } from "typeorm";
import { Relation } from './relation.entity';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { MessageEntity } from 'src/chat/entities/message.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  avatar?: string;

  @Column({ default: 0 })
  gamesCount?: number;

  @Column({ default: 0 })
  gamesWon?: number;

  @Column({ default: false })
  is2FAEnabled?: boolean;

  @Column({ nullable: true })
  twoFASecret?: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  public created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  public updated_at: Date;

  @OneToMany(() => MembersEntity, member => member.user)
  public memberShip!: MembersEntity[];

  @OneToMany(() => MessageEntity, message => message.user)
  public messages!: MessageEntity[];

  @OneToMany(() => Game, game => game.firstPlayer)
  gamesAsFirstPlayer: Game[];

  @OneToMany(() => Game, game => game.secondPlayer)
  gamesAsSecondPlayer: Game[];

  @OneToMany(() => Game, game => game.winner)
  wins: Game[];

  @OneToMany(() => Relation, relation => relation.userFirst)
  relationsFirst: Relation[];

  @OneToMany(() => Relation, relation => relation.userSecond)
  relationsSecond: Relation[];

  @OneToMany(() => Relation, relation => relation.blocker)
  BlockedRelations: Relation[];

  @OneToMany(() => Relation, relation => relation.requester)
  FriendshipRequests: Relation[];

  @OneToMany(() => RoomEntity, room => room.owner)
  ownedRooms: RoomEntity[];

  @OneToMany(() => MessageEntity, room => room.challangedUser)
  challanges: MessageEntity[];
}
