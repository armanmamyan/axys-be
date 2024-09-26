import { Module } from '@nestjs/common';
import { ThirdPartiesController } from './third-parties.controller';
import { OpenseaService } from './opensea/opensea.service';

@Module({
	controllers: [ThirdPartiesController],
	providers: [
		OpenseaService,
	],
	exports: [
		OpenseaService,
	]
})
export class ThirdPartiesModule {}
