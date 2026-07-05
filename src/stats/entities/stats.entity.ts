import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Championship } from '../../championship/entities/championship.entity';
import { Team } from '../../team/entities/team.entity';
import { User } from '../../user/entities/user.entity';
import { Visitor } from '../../user/entities/visitor.entity';

@Entity('stats')
export class Stats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  goals: number;

  @Column({ default: 0 })
  redCards: number;

  @Column({ default: 0 })
  yellowCards: number;

  @Column({ default: 0 })
  assists: number;

  @ManyToOne(() => Championship, (championship) => championship.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'championshipId' })
  championship: Championship;

  @Column()
  championshipId: string;

  @ManyToOne(() => Team, (team) => team.stats, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'teamId' })
  team?: Team;

  @Column({ nullable: true })
  teamId?: string;

  @ManyToOne(() => User, (user) => user.stats, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => Visitor, (visitor) => visitor.stats, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'visitorId' })
  visitor?: Visitor;

  @Column({ nullable: true })
  visitorId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
