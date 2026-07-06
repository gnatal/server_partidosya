import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ description: 'Location of the user', example: 'Boston, USA' })
  @IsNotEmpty({ message: 'Location is required' })
  @IsString()
  @MaxLength(200)
  location: string;
}
