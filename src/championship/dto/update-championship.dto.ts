import { PartialType } from '@nestjs/swagger';
import { CreateChampionshipDto } from './create-championship.dto';

export class UpdateChampionshipDto extends PartialType(CreateChampionshipDto) {}
