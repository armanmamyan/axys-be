import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

if (process.env.STAGE !== 'prod') {
  dotenv.config({ path: path.resolve(__dirname, `../../.env`) });
}

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(<string>process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
  ssl: process.env.STAGE === 'prod' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  dropSchema: false,
});
