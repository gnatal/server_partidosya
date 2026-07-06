import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Championship } from './entities/championship.entity';
import { Staff } from '../staff/entities/staff.entity';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ChampionshipService {
  constructor(
    @InjectRepository(Championship)
    private readonly championshipRepository: Repository<Championship>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
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
}
