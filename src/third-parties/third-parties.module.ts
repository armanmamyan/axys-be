import { Module } from '@nestjs/common';
import { ThirdPartiesController } from './third-parties.controller';
import { OpenseaService } from './opensea/opensea.service';
import { NeogardenNftService } from './neogarden-nft/neogarden-nft.service';
import { StripeService } from './stripe/stripe.service';

@Module({
  controllers: [ThirdPartiesController],
  providers: [OpenseaService, NeogardenNftService, StripeService],
  exports: [OpenseaService, NeogardenNftService, StripeService],
})
export class ThirdPartiesModule {}
