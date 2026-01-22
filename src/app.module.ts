import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RankingModule } from 'src/ranking/ranking.module';
import { Ranking } from './ranking/entities/ranking.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      // credentials for connecting to NEON
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,

      // Neon connection string
      models: [Ranking],
      autoLoadModels: true,
      synchronize: true, // OK for dev
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),
    RankingModule,
  ],
})
export class AppModule {}
