import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from '../../team/entities/team.entity';
import { Stand } from '../../stands/entities/stand.entity';
import { Stats } from '../../stats/entities/stats.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity('championships')
export class Championship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  rules?: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ nullable: true })
  prize?: string;

  @Column({ nullable: true })
  banner?: string;

  @ManyToMany(() => Team, (team) => team.championships)
  @JoinTable({
    name: 'championship_teams',
    joinColumn: { name: 'championshipId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'teamId', referencedColumnName: 'id' },
  })
  teams: Team[];

  @OneToMany(() => Stand, (stand) => stand.championship)
  stands: Stand[];

  @OneToMany(() => Stats, (stats) => stats.championship)
  stats: Stats[];

  @OneToMany(() => Staff, (staff) => staff.championship)
  staff: Staff[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
