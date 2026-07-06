import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Team } from '../../team/entities/team.entity';
import { Stats } from '../../stats/entities/stats.entity';

@Entity('visitors')
export class Visitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  age?: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  location?: string;

  @OneToOne(() => User, (user) => user.visitor, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId?: string;

  @ManyToMany(() => Team, (team) => team.visitorPlayers)
  teams: Team[];

  @OneToMany(() => Team, (team) => team.captainVisitor)
  captainTeams: Team[];

  @OneToMany(() => Stats, (stats) => stats.visitor)
  stats: Stats[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
