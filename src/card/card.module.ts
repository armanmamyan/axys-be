import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { CardOrder } from 'src/card-orders/entities/card-order.entity';
import { CardsService } from './services/card.service';

@Module({
  imports: [TypeOrmModule.forFeature([Card, CardOrder])],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}