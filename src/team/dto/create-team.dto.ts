import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    description: 'Name of the team',
    example: 'Dream Team FC',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Optional team profile picture (image file)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  profilePicture?: any;

  @ApiProperty({
    description: 'Optional captain user ID',
    example: 'd3b07384-d113-4ec6-a558-7beb315d7f6c',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  captainUserId?: string;

  @ApiProperty({
    description: 'Optional captain visitor ID',
    example: 'a4b07384-d113-4ec6-a558-7beb315d7f6c',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  captainVisitorId?: string;
}
