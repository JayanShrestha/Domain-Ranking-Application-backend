import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

@Get('tranco')
async fetchAndStoreTrancoRanking(
  @Query('domain') domain: string,
){
  return this.rankingService.fetchAndStoreTrancoRanking(domain);
}


  @Get()
  findAll() {
    return this.rankingService.findAll();
  }
}