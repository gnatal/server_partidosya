import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';

interface RequestUser {
  id: string;
  email: string;
  username?: string;
}

@ApiTags('User Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile found successfully.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async getProfile(@Req() req: Request) {
    const user = req.user as RequestUser;
    return this.userService.getProfile(user.id);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Create or update user profile (upsert)' })
  @ApiResponse({
    status: 201,
    description: 'Profile successfully created or updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async upsertProfile(
    @Req() req: Request,
    @Body() upsertProfileDto: UpsertProfileDto,
  ) {
    const user = req.user as RequestUser;
    return this.userService.upsertProfile(user.id, upsertProfileDto);
  }

  @Patch('profile/location')
  @ApiOperation({ summary: 'Update user profile location' })
  @ApiResponse({
    status: 200,
    description:
      'Location successfully updated (profile created if not existing).',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateLocation(
    @Req() req: Request,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    const user = req.user as RequestUser;
    return this.userService.updateLocation(user.id, updateLocationDto.location);
  }

  @Patch('username')
  @ApiOperation({ summary: 'Update username' })
  @ApiResponse({ status: 200, description: 'Username successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 409, description: 'Username already taken.' })
  async updateUsername(
    @Req() req: Request,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    const user = req.user as RequestUser;
    return this.userService.updateUsername(user.id, updateUsernameDto.username);
  }
}
