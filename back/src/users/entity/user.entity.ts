import { MembersEntity } from 'src/chat/entities/members.entity';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CreateDateColumn,UpdateDateColumn } from "typeorm";

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

  @OneToMany(() => MembersEntity, member => member.user)
  public messages!: MembersEntity[];
}
