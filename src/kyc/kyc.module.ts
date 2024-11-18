import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KYC } from './entities/kyc.entity';
import { KycService } from './services/kyc.service';
import { UsersModule } from '@/users/users.module';
import { ThirdPartiesModule } from '@/third-parties/third-parties.module';
import { CardOrdersModule } from '@/card-orders/card-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KYC]),
    forwardRef(() => UsersModule),
    forwardRef(() => ThirdPartiesModule),
    forwardRef(() => CardOrdersModule),
  ],
  providers: [KycService],
  exports: [KycService],
})
export class KYCModule {}
