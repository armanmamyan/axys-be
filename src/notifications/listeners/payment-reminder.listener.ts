import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../services/notifications.service';
import { CardOrder } from 'src/card-orders/entities/card-order.entity';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class PaymentReminderListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('payment.reminder')
  async handlePaymentReminderEvent(order: CardOrder) {
    const message = `Dear ${order.user?.name || order.user?.email}, your monthly payment is due. Please make the payment to continue enjoying our services.`;
    await this.notificationsService.createNotification(
      order.user.email,
      NotificationType.PAYMENT_REMINDER,
      message,
    );
    await this.notificationsService.sendEmailNotification(
      order.user.email,
      NotificationType.PAYMENT_REMINDER,
      message
    )
  }
}
