import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '../entities/notification.entity';
import { NotificationsService } from '../services/notifications.service';
import { getTransactionExplorerURL } from '@/utils/getTransactionExplorerURL';

interface IOrderCreationData {
  email: string;
  date: number;
  deliveryAddress: string;
  itemName: string;
  price: number;
  orderLink: string;
  orderNumber: number;
}

@Injectable()
export class OrderListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('order.approved')
  async handleOrderCreatedEvent(order: any) {
    // Handle the event
    const message = `Your order #${order.id} has been created.`;
    await this.notificationsService.createNotification(
      order.user.email,
      NotificationType.NEW_MESSAGE,
      message
    );

    const { cardCategory, id, cardType, date, deliveryAddress, paymentPlan, paymentReceipt } = order;
    
    const body: IOrderCreationData ={
      email: order.user.email,
      deliveryAddress: Object.values(deliveryAddress)?.filter(Boolean).join(', '),
      date,
      orderNumber: id,
      price: paymentReceipt.price,
      // FIXME: /user/[userId]/apply-for-card/[orderId]/payment
      orderLink: getTransactionExplorerURL(
        Number(paymentReceipt.currentChain?.id),
        paymentReceipt.hash
      ),
      itemName: `${cardCategory} ${cardType} | ${paymentPlan} Fee`,
    };

    await this.notificationsService.sendReceiptlNotification(
      order.user.email,
      `Subscription #${order.id} Receipt.`,
      { ...body, orderNumber: order.id }
    );
  }
}
