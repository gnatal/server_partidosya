import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Championship } from './entities/championship.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Team } from '../team/entities/team.entity';
import { User } from '../user/entities/user.entity';
import { Visitor } from '../user/entities/visitor.entity';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { AddTeamDto } from './dto/add-team.dto';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ChampionshipService {
  constructor(
    @InjectRepository(Championship)
    private readonly championshipRepository: Repository<Championship>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Visitor)
    private readonly visitorRepository: Repository<Visitor>,
  ) {}

  private deleteFile(filePath: string) {
    if (!filePath) return;
    const absolutePath = join(process.cwd(), filePath);
    fs.unlink(absolutePath, (err) => {
      if (err) {
        console.error(`Failed to delete file at ${absolutePath}:`, err);
      }
    });
  }

  async verifyStaff(championshipId: string, userId: string): Promise<void> {
    const staff = await this.staffRepository.findOne({
      where: { championshipId, userId },
    });
    if (!staff) {
      throw new ForbiddenException(
        'You do not have permission to modify this championship',
      );
    }
  }

  async create(
    createDto: CreateChampionshipDto,
    bannerPath: string | undefined,
    rulesPath: string | undefined,
    userId: string,
  ): Promise<Championship> {
    const championship = this.championshipRepository.create({
      name: createDto.name,
      prize: createDto.prize,
      startDate: createDto.startDate
        ? new Date(createDto.startDate)
        : undefined,
      endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
      banner: bannerPath,
      rules: rulesPath,
    });

    const savedChampionship =
      await this.championshipRepository.save(championship);

    // Automatically make creator the admin staff of this championship
    const staff = this.staffRepository.create({
      userId,
      championshipId: savedChampionship.id,
      privileges: 'admin',
    });
    await this.staffRepository.save(staff);

    return savedChampionship;
  }

  async findAll(): Promise<Championship[]> {
    return this.championshipRepository.find({
      relations: {
        teams: true,
        stands: true,
        stats: true,
        staff: true,
      },
    });
  }

  async findOne(id: string): Promise<Championship> {
    const championship = await this.championshipRepository.findOne({
      where: { id },
      relations: {
        teams: true,
        stands: true,
        stats: true,
        staff: true,
      },
    });
    if (!championship) {
      throw new NotFoundException('Championship not found');
    }
    return championship;
  }

  async update(
    id: string,
    updateDto: UpdateChampionshipDto,
    bannerPath: string | undefined,
    rulesPath: string | undefined,
    userId: string,
  ): Promise<Championship> {
    await this.verifyStaff(id, userId);

    const championship = await this.championshipRepository.findOne({
      where: { id },
    });
    if (!championship) {
      throw new NotFoundException('Championship not found');
    }

    if (rulesPath !== undefined) {
      if (championship.rules) {
        this.deleteFile(championship.rules);
      }
      championship.rules = rulesPath;
    }

    if (bannerPath !== undefined) {
      if (championship.banner) {
        this.deleteFile(championship.banner);
      }
      championship.banner = bannerPath;
    }

    if (updateDto.name !== undefined) {
      championship.name = updateDto.name;
    }
    if (updateDto.prize !== undefined) {
      championship.prize = updateDto.prize;
    }
    if (updateDto.startDate !== undefined) {
      championship.startDate = updateDto.startDate
        ? new Date(updateDto.startDate)
        : undefined;
    }
    if (updateDto.endDate !== undefined) {
      championship.endDate = updateDto.endDate
        ? new Date(updateDto.endDate)
        : undefined;
    }

    return this.championshipRepository.save(championship);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.verifyStaff(id, userId);

    const championship = await this.championshipRepository.findOne({
      where: { id },
    });
    if (!championship) {
      throw new NotFoundException('Championship not found');
    }

    if (championship.rules) {
      this.deleteFile(championship.rules);
    }
    if (championship.banner) {
      this.deleteFile(championship.banner);
    }

    await this.championshipRepository.remove(championship);
  }

  async addTeam(
    championshipId: string,
    addTeamDto: AddTeamDto,
    userId: string,
  ): Promise<Championship> {
    await this.verifyStaff(championshipId, userId);

    const championship = await this.championshipRepository.findOne({
      where: { id: championshipId },
      relations: { teams: true },
    });
    if (!championship) {
      throw new NotFoundException('Championship not found');
    }

    let team: Team;
    if (addTeamDto.teamId) {
      const foundTeam = await this.teamRepository.findOne({
        where: { id: addTeamDto.teamId },
      });
      if (!foundTeam) {
        throw new NotFoundException('Team not found');
      }
      team = foundTeam;
    } else if (addTeamDto.name) {
      if (addTeamDto.captainUserId) {
        const userExists = await this.userRepository.findOne({
          where: { id: addTeamDto.captainUserId },
        });
        if (!userExists) {
          throw new NotFoundException('Captain user not found');
        }
      }

      if (addTeamDto.captainVisitorId) {
        const visitorExists = await this.visitorRepository.findOne({
          where: { id: addTeamDto.captainVisitorId },
        });
        if (!visitorExists) {
          throw new NotFoundException('Captain visitor not found');
        }
      }

      team = this.teamRepository.create({
        name: addTeamDto.name,
        profilePicture: addTeamDto.profilePicture,
        captainUserId: addTeamDto.captainUserId,
        captainVisitorId: addTeamDto.captainVisitorId,
      });
      team = await this.teamRepository.save(team);
    } else {
      throw new BadRequestException('Either teamId or name must be provided');
    }

    const exists = championship.teams.some((t) => t.id === team.id);
    if (!exists) {
      championship.teams.push(team);
      await this.championshipRepository.save(championship);
    }

    return this.findOne(championshipId);
  }

  async removeTeam(
    championshipId: string,
    teamId: string,
    userId: string,
  ): Promise<Championship> {
    await this.verifyStaff(championshipId, userId);

    const championship = await this.championshipRepository.findOne({
      where: { id: championshipId },
      relations: { teams: true },
    });
    if (!championship) {
      throw new NotFoundException('Championship not found');
    }

    const teamIndex = championship.teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) {
      throw new NotFoundException('Team not found in this championship');
    }

    championship.teams.splice(teamIndex, 1);
    await this.championshipRepository.save(championship);

    return this.findOne(championshipId);
  }
}
