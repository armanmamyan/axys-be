import { DataSource } from 'typeorm';
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(__dirname, `../../.env`) })

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'armanmamyan',
  password: 'pindparol',
  database: 'axys-be',
  entities: [__dirname + '/../**/*.entity.ts'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
  synchronize: false,
  dropSchema: false,
});