import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChampionshipDto {
  @ApiProperty({
    description: 'Name of the championship',
    example: 'Copa America 2026',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Championship rules (PDF file)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  rules?: any;

  @ApiProperty({
    description: 'Start date of the championship',
    example: '2026-07-06T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'End date of the championship',
    example: '2026-08-06T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: 'Prize details',
    example: 'Trophy + $5000 USD',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  prize?: string;

  @ApiProperty({
    description: 'Championship banner (image file)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  banner?: any;
}
