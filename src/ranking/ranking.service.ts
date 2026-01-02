import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/sequelize';
import { Ranking } from './entities/ranking.entity';
import { firstValueFrom } from 'rxjs';
import { RankingModule } from './ranking.module';

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

///fetching for single domain ranks
async fetchAndStoreTrancoRanking(domain:string){
  // getting data from API
  console.log("Fetching Tranco rank for:", domain);
  
  // check neon for latest record or checking the freshness of the data
  const latest = await this.getLatestRecord(domain);
  if(latest && this.isFresh(latest.updatedAt)){// checking is the updated dates are under 24 hours
    console.log("Serving from cache:",domain);
    const cachedData = await this.rankingModel.findAll({
      where:{domain},
      order:[['checkedAt','DESC']],
    });
    return{
      success:true,
      cached:true,
      count:cachedData.length,
      records:cachedData,
    };

  }
  else{
  console.log("Cache has expired or empty. Fetching fresh data");
  await this.deleteOldRecords(domain);
  //New or fresh data fetched from tranco
  const data = await this.fetchTrancoRanking(domain);
  console.log("Tranco API response:", data);

  if(!data || !data.ranks || data.ranks.length ===0){
    throw new Error (`No tranco ranking found for domain: ${domain}`);
    
  }// throws error if the data ranks is empty from tranco


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
}
//fetching multiple domains rank

async fetchAndStoreMultipleDomains(domains: string[]){
  console.log("Fetching Tranco rank for:", domains);
  const results: RankingModule []=[];// as this has cached object
  for (const domain of domains){//for each domain name
    const latest = await this.getLatestRecord(domain);// checking if the data exists in the database
    if(latest && this.isFresh(latest.updatedAt)){
     console.log("Serving from cache:",domain);
    const cachedData = await this.rankingModel.findAll({
      where:{domain},
      order:[['checkedAt','DESC']],
    });
    results.push({//[pushing cached data to results]
    domain,
    cached:true,
    count: cachedData.length,
    records:cachedData,
    });
    continue;//continues through the loop again for checking cache.
    }else{
      console.log("Deleting old data; and fetching from tranco:");
    await this.deleteOldRecords(domain);
    const data = await this.fetchTrancoRanking(domain);
    //array for new fetched data
    const savedRecords: Ranking[]=[];
    for(const entry of data.ranks){
    const saved = await this.saveRankingToDB(
      domain,
      entry.rank,
      entry.date
    );
    savedRecords.push(saved);
  }
  results.push({
    domain,
    cached:false,
    count:savedRecords.length,
    records:savedRecords,
  });
  continue;// continues through the loop
  } 
  }
  return {
    success:true,
    results,
  };

}

// helper to check cache freshness

private isFresh(date:Date):boolean{
  const now = new Date();
  const diff = now.getTime()-date.getTime();
  const hours = diff/(1000*60*60)
  console.log(hours);
  return hours<24;
}
//getting the latest records from Neon
async getLatestRecord(domain:string){
  return this.rankingModel.findOne({
    where:{domain},
    order:[['checkedAt', 'DESC']],
  });
}

//delete the old records
async deleteOldRecords(domain:string){
  await this.rankingModel.destroy({
    where: {domain},
  })
}
  async findAll() {
    return this.rankingModel.findAll();
  }
}