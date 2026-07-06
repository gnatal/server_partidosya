import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class UpsertProfileDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Age of the user', example: 25, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(120)
  age?: number;

  @ApiProperty({
    description: 'Location of the user',
    example: 'New York, USA',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/pic.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  picture?: string;
}
