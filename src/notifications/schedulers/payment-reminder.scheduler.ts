import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersService } from 'src/card-orders/services/card-orders.service';

@Injectable()
export class PaymentReminderScheduler {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Runs every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handlePaymentReminders() {
    const today = new Date();
    const orders = await this.ordersService.getOrdersDueForPayment(today);
    
    for (const order of orders) { 
     // Emit event to notify user
      this.eventEmitter.emit('payment.reminder', order);
    }
  }
}
