import { Controller, Get, Post, Body } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Post()
  create(@Body() body: { domain: string; rank: number }) {
    return this.rankingService.create(body.domain, body.rank);
  }

  @Get()
  findAll() {
    return this.rankingService.findAll();
  }
}