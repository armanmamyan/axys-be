import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KYC } from './entities/kyc.entity';
import { KycService } from './services/kyc.service';
import { KycController } from './controllers/kyc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KYC])],
  providers: [KycService],
  controllers: [KycController],
})
export class KYCModule {}