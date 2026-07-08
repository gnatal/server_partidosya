import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Visitor } from '../../user/entities/visitor.entity';
import { Championship } from '../../championship/entities/championship.entity';
import { Stand } from '../../stands/entities/stand.entity';
import { Stats } from '../../stats/entities/stats.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @ManyToMany(() => User, (user) => user.teams)
  @JoinTable({
    name: 'team_users',
    joinColumn: { name: 'teamId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  players: User[];

  @ManyToMany(() => Visitor, (visitor) => visitor.teams)
  @JoinTable({
    name: 'team_visitors',
    joinColumn: { name: 'teamId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'visitorId', referencedColumnName: 'id' },
  })
  visitorPlayers: Visitor[];

  @ManyToOne(() => User, (user) => user.captainTeams, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'captainUserId' })
  captainUser?: User;

  @Column({ nullable: true })
  captainUserId?: string;

  @ManyToOne(() => Visitor, (visitor) => visitor.captainTeams, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'captainVisitorId' })
  captainVisitor?: Visitor;

  @Column({ nullable: true })
  captainVisitorId?: string;

  @ManyToMany(() => Championship, (championship) => championship.teams)
  championships: Championship[];

  @ManyToMany(() => Stand, (stand) => stand.teams)
  stands: Stand[];

  @OneToMany(() => Stats, (stats) => stats.team)
  stats: Stats[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
