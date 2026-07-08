import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { User } from '../user/entities/user.entity';
import { Visitor } from '../user/entities/visitor.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Visitor)
    private readonly visitorRepository: Repository<Visitor>,
  ) {}

  async create(
    createDto: CreateTeamDto,
    profilePicturePath?: string,
  ): Promise<Team> {
    if (createDto.captainUserId) {
      const userExists = await this.userRepository.findOne({
        where: { id: createDto.captainUserId },
      });
      if (!userExists) {
        throw new NotFoundException('Captain user not found');
      }
    }

    if (createDto.captainVisitorId) {
      const visitorExists = await this.visitorRepository.findOne({
        where: { id: createDto.captainVisitorId },
      });
      if (!visitorExists) {
        throw new NotFoundException('Captain visitor not found');
      }
    }

    const team = this.teamRepository.create({
      name: createDto.name,
      profilePicture:
        profilePicturePath || (createDto.profilePicture as string),
      captainUserId: createDto.captainUserId,
      captainVisitorId: createDto.captainVisitorId,
    });

    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      relations: {
        players: true,
        visitorPlayers: true,
        captainUser: true,
        captainVisitor: true,
        championships: true,
      },
    });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: {
        players: true,
        visitorPlayers: true,
        captainUser: true,
        captainVisitor: true,
        championships: true,
      },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async update(
    id: string,
    updateDto: UpdateTeamDto,
    profilePicturePath?: string,
  ): Promise<Team> {
    const team = await this.findOne(id);

    if (updateDto.captainUserId) {
      const userExists = await this.userRepository.findOne({
        where: { id: updateDto.captainUserId },
      });
      if (!userExists) {
        throw new NotFoundException('Captain user not found');
      }
      team.captainUserId = updateDto.captainUserId;
    }

    if (updateDto.captainVisitorId) {
      const visitorExists = await this.visitorRepository.findOne({
        where: { id: updateDto.captainVisitorId },
      });
      if (!visitorExists) {
        throw new NotFoundException('Captain visitor not found');
      }
      team.captainVisitorId = updateDto.captainVisitorId;
    }

    if (updateDto.name !== undefined) {
      team.name = updateDto.name;
    }

    if (profilePicturePath !== undefined) {
      team.profilePicture = profilePicturePath;
    } else if (updateDto.profilePicture !== undefined) {
      team.profilePicture = updateDto.profilePicture as string;
    }

    return this.teamRepository.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }
}
