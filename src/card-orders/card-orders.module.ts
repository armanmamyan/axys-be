import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardOrder } from './entities/card-order.entity';
import { CardsModule } from 'src/card/card.module';
import { OrdersService } from './services/card-orders.service';
import { User } from 'src/users/entities/user.entity';
import { Card } from 'src/card/entities/card.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from '@/notifications/notifications.module';
import { ThirdPartiesModule } from '@/third-parties/third-parties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CardOrder, User]),
    CardsModule,
    NotificationsModule,
    EventEmitterModule.forRoot(),
    forwardRef(() => ThirdPartiesModule),
  ],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class CardOrdersModule {}