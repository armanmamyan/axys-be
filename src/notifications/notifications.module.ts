import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { CardOrdersModule } from 'src/card-orders/card-orders.module';
import { PaymentReminderListener } from './listeners/payment-reminder.listener';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    ScheduleModule.forRoot(),
    CardOrdersModule,
    UsersModule
  ],
  providers: [NotificationsService, PaymentReminderListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
