import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddTeamDto {
  @ApiProperty({
    description: 'ID of an existing team to add to the championship',
    example: 'b7b07384-d113-4ec6-a558-7beb315d7f6c',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiProperty({
    description: 'Name of a new team to create and add to the championship',
    example: 'New Champions FC',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description:
      'Optional URL or file path for the team profile picture (if creating a new team)',
    example: '/uploads/team-pic-123.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({
    description: 'Optional captain user ID (if creating a new team)',
    example: 'd3b07384-d113-4ec6-a558-7beb315d7f6c',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  captainUserId?: string;

  @ApiProperty({
    description: 'Optional captain visitor ID (if creating a new team)',
    example: 'a4b07384-d113-4ec6-a558-7beb315d7f6c',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  captainVisitorId?: string;
}
