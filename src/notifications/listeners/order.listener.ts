import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '../entities/notification.entity';
import { NotificationsService } from '../services/notifications.service';

@Injectable()
export class OrderListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('order.created')
  async handleOrderCreatedEvent(order: any, email: string) {
    // Handle the event
    const message = `Your order #${order.id} has been created.`;
    await this.notificationsService.createNotification(
      order.user.email,
      NotificationType.NEW_MESSAGE,
      message,
    );

    await this.notificationsService.sendEmailNotification(email, NotificationType.NEW_MESSAGE, `Your order #${order.id} has been created.`)
  }
}
