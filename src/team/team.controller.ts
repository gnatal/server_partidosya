import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const storageOptions = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `team-profile-${uniqueSuffix}${ext}`);
  },
});

import type { Request } from 'express';

const fileFilter = (
  req: Request,
  file: MulterFile,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    return cb(
      new BadRequestException(
        'Only image files are allowed for team profile picture!',
      ),
      false,
    );
  }
  cb(null, true);
};

@ApiTags('Team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: storageOptions,
      fileFilter: fileFilter,
    }),
  )
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @UploadedFile() file?: MulterFile,
  ) {
    const profilePicturePath = file ? `/uploads/${file.filename}` : undefined;
    return this.teamService.create(createTeamDto, profilePicturePath);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  @ApiResponse({ status: 200, description: 'Return all teams.' })
  async findAll() {
    return this.teamService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiResponse({ status: 200, description: 'Return the team.' })
  @ApiResponse({ status: 404, description: 'Team not found.' })
  async findOne(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing team' })
  @ApiResponse({ status: 200, description: 'Team updated successfully.' })
  @ApiResponse({ status: 404, description: 'Team not found.' })
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: storageOptions,
      fileFilter: fileFilter,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @UploadedFile() file?: MulterFile,
  ) {
    const profilePicturePath = file ? `/uploads/${file.filename}` : undefined;
    return this.teamService.update(id, updateTeamDto, profilePicturePath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a team' })
  @ApiResponse({ status: 200, description: 'Team deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Team not found.' })
  async remove(@Param('id') id: string) {
    await this.teamService.remove(id);
    return { message: 'Team successfully deleted' };
  }
}
