import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { CardOrder } from '@/card-orders/entities/card-order.entity';
import { Repository } from 'typeorm';
import { OrderStatus } from '@/card-orders/enums';

@Injectable()
export class StripeListener {
  constructor(
    @InjectRepository(CardOrder)
    private cardOrderRepository: Repository<CardOrder>,
    private mailerService: MailerService
  ) {}

  @OnEvent('payment.created')
  async handleOrderCreatedEvent(invoice: any, email: string) {
    const amountInCents = invoice.amount_paid;
    const amountInDollars = (amountInCents / 100).toFixed(2);

    await this.mailerService.sendMail({
      to: email,
      subject: `Subscription #${invoice.id} Receipt.`,
      template: 'light-receipt-stripe',
      context: {
        email,
        date: new Date(invoice.created * 1000),
        itemName: invoice.lines.data[0].description,
        orderTotal: amountInDollars,
        orderLink: invoice.hosted_invoice_url,
        orderNumber: invoice.id,
      },
    });
  }

  @OnEvent('payment.rejected')
  async handleRejectedOrderEvent(invoice: any, email: string) {
    const amountInCents = invoice.amount_paid;
    const amountInDollars = (amountInCents / 100).toFixed(2);
    const orderId = invoice.metadata.orderId;

    await this.cardOrderRepository
      .createQueryBuilder()
      .update(CardOrder)
      .set({ status: OrderStatus.REJECTED })
      .where({
        id: orderId,
      })
      .returning('*')
      .execute();

    await this.mailerService.sendMail({
      to: email,
      subject: `Subscription #${invoice.id} Receipt.`,
      template: 'light-receipt-failed-stripe',
      context: {
        email,
        date: new Date(invoice.created * 1000),
        itemName: invoice.lines.data[0].description,
        orderTotal: amountInDollars,
        orderLink: invoice.hosted_invoice_url,
        orderNumber: invoice.id,
      },
    });
  }
}
