import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/sequelize';
import { Ranking } from './entities/ranking.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RankingService {
  constructor(
    @InjectModel(Ranking)
    private rankingModel: typeof Ranking,
    private readonly httpService: HttpService,
  ) {}

// fetching data from tranco
async fetchTrancoRanking(domain:string){
  const url = `https://tranco-list.eu/api/ranks/domain/${domain}`;
  const response = await firstValueFrom(
    this.httpService.get(url),
  );
  return response.data; // return { domain, ranks:[....]}

}
//function to save data into Neon
async saveRankingToDB(domain:string,rank:number, date:string){
  const record = await this.rankingModel.create({
    domain,
    rank,
    checkedAt: new Date(date),//using dates from api
  }as Ranking);
  return record;
}

async fetchAndStoreTrancoRanking(domain:string){
  // getting data from API
  console.log("Fetching Tranco rank for:", domain);
  
  const data = await this.fetchTrancoRanking(domain);
  console.log("Tranco API response:", data);

  //const {rank} = await this.fetchTrancoRanking(domain);
  // saving to neon via sequelize
  const savedRecords: Ranking[] = [];//changing the type to ranking so ranking type data can be pushed.
  for(const entry of data.ranks){
    const saved = await this.saveRankingToDB(
      domain,
      entry.rank,
      entry.date
    );
    savedRecords.push(saved);
  }
  
  return {
    success:true,
    count:savedRecords.length,
    savedRecords,
  };
}

  async findAll() {
    return this.rankingModel.findAll();
  }
}