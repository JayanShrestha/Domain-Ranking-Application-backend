import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Ranking } from './entities/ranking.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectModel(Ranking)
    private rankingModel: typeof Ranking,
  ) {}

  async create(domain: string, rank: number) {
    return this.rankingModel.create({ domain, rank });
  }

  async findAll() {
    return this.rankingModel.findAll();
  }
}