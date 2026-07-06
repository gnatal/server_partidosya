import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChampionshipService } from './championship.service';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';

interface RequestUser {
  id: string;
  email: string;
  username?: string;
}

// Ensure the uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

const storageOptions = diskStorage({
  destination: './uploads',
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (file.fieldname === 'rules') {
    if (!file.originalname.match(/\.(pdf)$/i)) {
      return cb(
        new BadRequestException('Only PDF files are allowed for rules!'),
        false,
      );
    }
  } else if (file.fieldname === 'banner') {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return cb(
        new BadRequestException('Only image files are allowed for banner!'),
        false,
      );
    }
  }
  cb(null, true);
};

@ApiTags('Championship')
@Controller('championship')
export class ChampionshipController {
  constructor(private readonly championshipService: ChampionshipService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new championship' })
  @ApiResponse({
    status: 201,
    description: 'Championship created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid file formats or input.' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'banner', maxCount: 1 },
        { name: 'rules', maxCount: 1 },
      ],
      {
        storage: storageOptions,
        fileFilter: fileFilter,
      },
    ),
  )
  async create(
    @Req() req: Request,
    @Body() createChampionshipDto: CreateChampionshipDto,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      rules?: Express.Multer.File[];
    },
  ) {
    const user = req.user as RequestUser;
    const bannerFile = files?.banner?.[0];
    const bannerPath = bannerFile
      ? `/uploads/${bannerFile.filename}`
      : undefined;

    const rulesFile = files?.rules?.[0];
    const rulesPath = rulesFile ? `/uploads/${rulesFile.filename}` : undefined;

    return this.championshipService.create(
      createChampionshipDto,
      bannerPath,
      rulesPath,
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all championships' })
  @ApiResponse({ status: 200, description: 'Return all championships.' })
  async findAll() {
    return this.championshipService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a championship by ID' })
  @ApiResponse({ status: 200, description: 'Return the championship.' })
  @ApiResponse({ status: 404, description: 'Championship not found.' })
  async findOne(@Param('id') id: string) {
    return this.championshipService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing championship' })
  @ApiResponse({
    status: 200,
    description: 'Championship updated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not staff.' })
  @ApiResponse({ status: 404, description: 'Championship not found.' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'banner', maxCount: 1 },
        { name: 'rules', maxCount: 1 },
      ],
      {
        storage: storageOptions,
        fileFilter: fileFilter,
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateChampionshipDto: UpdateChampionshipDto,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      rules?: Express.Multer.File[];
    },
  ) {
    const user = req.user as RequestUser;
    const bannerFile = files?.banner?.[0];
    const bannerPath = bannerFile
      ? `/uploads/${bannerFile.filename}`
      : undefined;

    const rulesFile = files?.rules?.[0];
    const rulesPath = rulesFile ? `/uploads/${rulesFile.filename}` : undefined;

    return this.championshipService.update(
      id,
      updateChampionshipDto,
      bannerPath,
      rulesPath,
      user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a championship' })
  @ApiResponse({
    status: 200,
    description: 'Championship deleted successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not staff.' })
  @ApiResponse({ status: 404, description: 'Championship not found.' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    await this.championshipService.remove(id, user.id);
    return { message: 'Championship successfully deleted' };
  }
}
