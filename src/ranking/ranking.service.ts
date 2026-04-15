import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/sequelize';
import { Ranking } from './entities/ranking.entity';
import { firstValueFrom } from 'rxjs';

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

  // fetching data from tranco
  async fetchTrancoRanking(domain: string): Promise<Tranco> {
    try {
      const url = `https://tranco-list.eu/api/ranks/domain/${domain}`;
      const response = await firstValueFrom(this.httpService.get(url));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response.data; // return { domain, ranks:[....]}
    } catch (error) {
      // Log error for diagnostics
      console.error('Failed to fetch Tranco ranking:', error);
      // Throw application-specific error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to fetch Tranco ranking for domain ${domain}: ${errorMessage}`,
      );
    }
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
    } else {
      console.log('Cache has expired or empty. Fetching fresh data');
      await this.deleteOldRecords(domain);
      //New or fresh data fetched from tranco
      const data = await this.fetchTrancoRanking(domain);
      console.log('Tranco API response:', domain);

      if (!data || !data.ranks || data.ranks.length === 0) {
        throw new Error(`No tranco ranking found for domain: ${domain}`);
      } // throws error if the data ranks is empty from tranco

      // saving to neon via sequelize
      const savedRecords: Ranking[] = []; //changing the type to ranking so ranking type data can be pushed.
      for (const entry of data.ranks) {
        const saved = await this.saveRankingToDB(
          domain,
          entry.rank,
          entry.date,
        );
        savedRecords.push(saved);
      }

      return {
        success: true,
        cached: false,
        count: savedRecords.length,
        records: savedRecords,
      };
    }
  }
  //fetching multiple domains rank

  async fetchAndStoreMultipleDomains(domains: string[]) {
    console.log('Fetching Tranco rank for:', domains);
    const tasks = domains.map(async (domain) => {
      try {
        const result = await this.fetchAndStoreTrancoRanking(domain);
        //consistent return value for safe return to frontend
        return {
          domain,
          cached: result.cached ?? false,
          count: result.count ?? 0,
          records: result.records ?? [],
          error: false,
        };
      } catch (err) {
        console.error(`Error processing ${domain}:`, err);
        return {
          domain,
          cached: false,
          count: 0,
          records: [],
          error: true,
          message: err instanceof Error ? err.message : String(err),
        };
      }
    });
    const results = await Promise.all(tasks);
    const safeResults = results.filter(Boolean);

    return {
      success: true,
      results: safeResults,
    };
  }

  // helper to check cache freshness

  private isFresh(date: Date): boolean {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    console.log(hours);
    return hours < 24;
  }
  //getting the latest records from Neon
  async getLatestRecord(domain: string) {
    return this.rankingModel.findOne({
      where: { domain },
      order: [['checkedAt', 'DESC']],
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
