import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async upsertProfile(
    userId: string,
    profileData: {
      name?: string;
      age?: number;
      location?: string;
      picture?: string;
    },
  ): Promise<Profile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile = await this.profileRepository.findOne({ where: { userId } });

    if (profile) {
      Object.assign(profile, profileData);
    } else {
      profile = this.profileRepository.create({
        ...profileData,
        userId,
      });
    }

    return this.profileRepository.save(profile);
  }

  async updateLocation(userId: string, location: string): Promise<Profile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile = await this.profileRepository.findOne({ where: { userId } });

    if (!profile) {
      profile = this.profileRepository.create({
        userId,
        location,
      });
    } else {
      profile.location = location;
    }

    return this.profileRepository.save(profile);
  }

  async updateUsername(userId: string, username: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username is already taken');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.username = username;
    const savedUser = await this.userRepository.save(user);
    delete savedUser.password;
    return savedUser;
  }
}
