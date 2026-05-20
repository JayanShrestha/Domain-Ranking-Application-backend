import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/sequelize';
import { Ranking } from './entities/ranking.entity';
import { RateLimiterQueue } from './limiter/rateLimiter';
import { coalesce } from './limiter/singleFlight';
import { RankingModule } from './ranking.module';

interface Tranco {
  domain: string;
  ranks: { rank: number; date: string }[];
  date: Date;
}

@Injectable()
export class RankingService {
  constructor(
    @InjectModel(Ranking)
    private rankingModel: typeof Ranking,
    private readonly httpService: HttpService,
  ) {}
  private trancoLimiter = new RateLimiterQueue(1500); // 1 req/sec

  private async callTranco(domain: string): Promise<Tranco> {
    try {
      return this.trancoLimiter.enqueue<Tranco>(() =>
        // eslint-disable-next-line prettier/prettier
    this.httpService.axiosRef.get(
            // eslint-disable-next-line prettier/prettier
      `https://tranco-list.eu/api/ranks/domain/${domain}`
          )
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          .then((res) => res.data),
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new Error('Error from Tranco');
    }
  }
  // fetching data from tranco
  async fetchTrancoRanking(domain: string): Promise<Tranco> {
    return coalesce<Tranco>(domain, () => this.callTranco(domain));
  }
  //function to save data into Neon
  async saveRankingToDB(domain: string, rank: number, date: string) {
    const record = await this.rankingModel.create({
      domain,
      rank,
      checkedAt: new Date(date), //using dates from api
    } as Ranking);
    return record;
  }

  ///fetching for single domain ranks
  async fetchAndStoreTrancoRanking(domain: string) {
    // getting data from API
    console.log('Fetching Tranco rank for:', domain);

    // check neon for latest record or checking the freshness of the data
    const latest = await this.getLatestRecord(domain);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (latest && this.isFresh(latest.updatedAt)) {
      // checking is the updated dates are under 24 hours
      console.log('Serving from cache:', domain);
      const cachedData = await this.rankingModel.findAll({
        where: { domain },
        order: [['checkedAt', 'DESC']],
      });
      return {
        success: true,
        cached: true,
        count: cachedData.length,
        records: cachedData,
      };
    }
    console.log('Cache has expired or empty. Fetching fresh data');
    await this.deleteOldRecords(domain);
    //New or fresh data fetched from tranco
    const data = await this.fetchTrancoRanking(domain);
    console.log('Tranco API response:', data);

    if (!data || !data.ranks || data.ranks.length === 0) {
      throw new Error(`No tranco ranking found for domain: ${domain}`);
    } // throws error if the data ranks is empty from tranco

    // saving to neon via sequelize
    for (const entry of data.ranks) {
      await this.saveRankingToDB(domain, entry.rank, entry.date);
    }
    const savedRecords = await this.rankingModel.findAll({
      where: { domain },
      order: [['checkedAt', 'DESC']],
    });
    console.log('Saved records:', savedRecords);
    return {
      success: true,
      cached: false,
      count: savedRecords.length,
      records: savedRecords,
    };
  }
  //fetching multiple domains rank

  async fetchAndStoreMultipleDomains(domains: string[]) {
    console.log('Fetching Tranco rank for:', domains);
    const results: RankingModule[] = []; // as this has cached object
    for (const domain of domains) {
      //for each domain name
      const latest = await this.getLatestRecord(domain); // checking if the data exists in the database
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (latest && this.isFresh(latest.updatedAt)) {
        console.log('Serving from cache:', domain);
        const cachedData = await this.rankingModel.findAll({
          where: { domain },
          order: [['checkedAt', 'DESC']],
        });
        results.push({
          //[pushing cached data to results]
          domain,
          cached: true,
          count: cachedData.length,
          records: cachedData,
        });
        continue; //continues through the loop again for checking cache.
      }
      console.log('Deleting old data; and fetching from tranco:');
      await this.deleteOldRecords(domain);
      const data = await this.fetchTrancoRanking(domain);
      //array for new fetched data
      const savedRecords: Ranking[] = [];
      for (const entry of data.ranks) {
        const saved = await this.saveRankingToDB(
          domain,
          entry.rank,
          entry.date,
        );
        savedRecords.push(saved);
      }
      results.push({
        domain,
        cached: false,
        count: savedRecords.length,
        records: savedRecords,
      });
    }
    console.log('Results:', results);
    return {
      success: true,
      results,
    };
  }
  // helper to check cache freshness

  private isFresh(date: Date): boolean {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    console.log(`The hour difference is ${hours}`);
    return hours < 24;
  }
  //getting the latest records from Neon
  async getLatestRecord(domain: string) {
    return this.rankingModel.findOne({
      where: { domain },
      order: [['updatedAt', 'DESC']],
    });
  }

  //delete the old records
  async deleteOldRecords(domain: string) {
    await this.rankingModel.destroy({
      where: { domain },
    });
  }
  async findAll() {
    return this.rankingModel.findAll();
  }
}
