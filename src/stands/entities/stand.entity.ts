import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Championship } from '../../championship/entities/championship.entity';
import { Team } from '../../team/entities/team.entity';

@Entity('stands')
export class Stand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', nullable: true })
  date?: Date;

  @Column({ nullable: true })
  result?: string;

  @ManyToOne(() => Championship, (championship) => championship.stands, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'championshipId' })
  championship: Championship;

  @Column()
  championshipId: string;

  @ManyToMany(() => Team, (team) => team.stands)
  @JoinTable({
    name: 'stands_teams',
    joinColumn: { name: 'standId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'teamId', referencedColumnName: 'id' },
  })
  teams: Team[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
