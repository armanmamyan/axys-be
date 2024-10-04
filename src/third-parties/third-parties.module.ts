import { Module } from '@nestjs/common';
import { ThirdPartiesController } from './third-parties.controller';
import { OpenseaService } from './opensea/opensea.service';
import { NeogardenNftService } from './neogarden-nft/neogarden-nft.service';

@Module({
  controllers: [ThirdPartiesController],
  providers: [OpenseaService, NeogardenNftService],
  exports: [OpenseaService, NeogardenNftService],
})
export class ThirdPartiesModule {}
