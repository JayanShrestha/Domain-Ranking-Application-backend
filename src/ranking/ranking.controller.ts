import { Controller, Get, Body, Query } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get('/')
  getRoot() {
    return { status: 'ok', message: 'Backend is running' };
  }
  @Get('tranco')
  async fetchAndStoreTrancoRanking(@Query('domain') domain: string) {
    return this.rankingService.fetchAndStoreTrancoRanking(
      domain.toLocaleLowerCase(),
    ); //converts the domain names to lowercase
  }
  @Get('tranco/multi')
  async fetchMultipleTrancoRanks(@Query('domains') domains: string) {
    const list = domains
      .split(',')
      .map((domain) => domain.trim().toLocaleLowerCase()); // splits the domains name into array and remove white spaces
    return this.rankingService.fetchAndStoreMultipleDomains(list); // returns the list
  }
  @Get()
  findAll() {
    return this.rankingService.findAll();
  }
}
