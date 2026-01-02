import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return { status: 'OK', message: 'Backend is running' };
  }
}


@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

@Get('tranco')
async fetchAndStoreTrancoRanking(
  @Query('domain') domain: string,
){
  return this.rankingService.fetchAndStoreTrancoRanking(domain);
}
@Get('tranco/multi')
async fetchMultipleTrancoRanks(
  @Query('domains') domains:string,
){
  const list = domains.split(',').map(domain=>domain.trim());// splits the domains name into array and remove white spaces
  return this.rankingService.fetchAndStoreMultipleDomains(list);// returns the list 

}
  @Get()
  findAll() {
    return this.rankingService.findAll();
  }
}