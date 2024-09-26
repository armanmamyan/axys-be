import { DataSource } from 'typeorm';
import { env } from 'process';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env.stage.local' });

export const dataSource = new DataSource({
	type: 'postgres',
	host: env.DB_HOST,
	port: parseInt(<string>env.DB_PORT),
	username: env.DB_USERNAME,
	password: env.DB_PASSWORD,
	database: env.DB_NAME,
	entities: [__dirname + '/../**/*.entity.ts'],
	migrations: [__dirname + '/../migrations/*{.ts,.js}'],
	extra: {
		charset: 'utf8mb4_unicode_ci'
	},
	ssl: {
		ca: env.DB_CA_CERT,
		rejectUnauthorized: false
	},
	synchronize: false,
	dropSchema: false
});
