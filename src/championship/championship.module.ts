import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Championship } from './entities/championship.entity';
import { Staff } from '../staff/entities/staff.entity';
import { ChampionshipService } from './championship.service';
import { ChampionshipController } from './championship.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Championship, Staff])],
  controllers: [ChampionshipController],
  providers: [ChampionshipService],
  exports: [ChampionshipService],
})
export class ChampionshipModule {}
