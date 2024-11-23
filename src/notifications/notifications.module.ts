import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { CardOrdersModule } from 'src/card-orders/card-orders.module';
import { PaymentReminderListener } from './listeners/payment-reminder.listener';
import { UsersModule } from 'src/users/users.module';
import { OrderListener } from './listeners/order.listener';
import { PaymentReminderScheduler } from './schedulers/payment-reminder.scheduler';
import { StripeListener } from './listeners/stripe-invoice.listener';
import { CardOrder } from '@/card-orders/entities/card-order.entity';
import { FireblocksListener } from './listeners/fireblocks-invoice';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, CardOrder]),
    ScheduleModule.forRoot(),
    forwardRef(() => CardOrdersModule),
    forwardRef(() => UsersModule),
  ],
  providers: [NotificationsService, PaymentReminderListener, OrderListener, PaymentReminderScheduler, StripeListener, FireblocksListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
