import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: async (): Promise<TypeOrmModuleOptions> => {
		return {
			type: 'postgres',
			host: process.env.DB_HOST,
			port: parseInt(<string>process.env.DB_PORT),
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			autoLoadEntities: true,
			entities: [__dirname + '/../**/*.entity.ts'],
			migrations: [__dirname + '/../migrations/*{.ts,.js}'],
			extra: {
				charset: 'utf8mb4_unicode_ci'
			},
			synchronize: process.env.STAGE === 'local',
			ssl:
				process.env.STAGE === 'staging' || process.env.STAGE === 'prod'
					? {
							ca: process.env.DB_CA_CERT,
							rejectUnauthorized: false
					  }
					: false
			// logging: true,
		};
	}
};
