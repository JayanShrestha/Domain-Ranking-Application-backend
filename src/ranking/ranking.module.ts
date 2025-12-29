import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ranking } from './entities/ranking.entity';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';

@Module({
  imports: [SequelizeModule.forFeature([Ranking])],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}