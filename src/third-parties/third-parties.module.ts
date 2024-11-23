import { forwardRef, Module } from '@nestjs/common';
import { ThirdPartiesController } from './third-parties.controller';
import { NeogardenNftService } from './neogarden-nft/neogarden-nft.service';
import { StripeService } from './stripe/stripe.service';
import { FireblocksService } from './fireblocks/fireblocks.service';
import { CMCService } from './cmc/cmc.service';
import { UsersModule } from '@/users/users.module';

@Module({
  controllers: [ThirdPartiesController],
  imports: [forwardRef(() => UsersModule)],
  providers: [NeogardenNftService, StripeService, FireblocksService, CMCService],
  exports: [NeogardenNftService, StripeService, FireblocksService, CMCService],
})
export class ThirdPartiesModule {}
