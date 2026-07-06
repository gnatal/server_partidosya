import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Visitor } from './visitor.entity';
import { RefreshToken } from './refresh-token.entity';
import { Team } from '../../team/entities/team.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Stats } from '../../stats/entities/stats.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    nullable: true,
  })
  profile?: Profile;

  @OneToOne(() => Visitor, (visitor) => visitor.user, {
    cascade: true,
    nullable: true,
  })
  visitor?: Visitor;

  @ManyToMany(() => Team, (team) => team.players)
  teams: Team[];

  @OneToMany(() => Team, (team) => team.captainUser)
  captainTeams: Team[];

  @OneToMany(() => Staff, (staff) => staff.user)
  staffs: Staff[];

  @OneToMany(() => Stats, (stats) => stats.user)
  stats: Stats[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
