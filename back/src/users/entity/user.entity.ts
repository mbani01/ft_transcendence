import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  // @Column()
  // token: string;
}
