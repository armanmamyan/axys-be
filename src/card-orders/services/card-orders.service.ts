import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { CardOrder } from '../entities/card-order.entity';
import { CardsService } from 'src/card/services/card.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentPlan } from 'src/card-orders/enums';
import { CreateOrderDto } from 'src/card-orders/dto/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StripeService } from '@/third-parties/stripe/stripe.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Parser } from 'json2csv';
import { AddressDto } from '@/kyc/dto/create-profile.dto';
import { PaymentType } from '@/transactions/enums';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(CardOrder)
    private cardOrderRepository: Repository<CardOrder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private stripeService: StripeService,
    private readonly mailerService: MailerService,
    private configService: ConfigService
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Partial<CardOrder>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['cardOrder'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const order = this.cardOrderRepository.create({
      ...createOrderDto,
      user,
      status: OrderStatus.PENDING,
      date: new Date(),
      paymentReceipt: createOrderDto.paymentType === PaymentType.CRYPTO ?  {
        ...createOrderDto.paymentReceipt,
        to: this.configService.get<string>('FB_FEE_ACCOUNT') || '1',
      } : {
        ...createOrderDto.paymentReceipt
      }
    });

    const nextPaymentDate = new Date(order.date);
    if (order.paymentPlan === PaymentPlan.MONTHLY) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    } else if (order.paymentPlan === PaymentPlan.ANNUAL) {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    }
    order.nextPaymentDate = nextPaymentDate;

    await this.cardOrderRepository.save(order);

    const {
      id,
      cardCategory,
      cardType,
      date,
      deliveryAddress,
      paymentPlan,
      paymentType,
      designNft,
      consumedNfts,
    } = order;
    return {
      id,
      cardCategory,
      cardType,
      date,
      deliveryAddress,
      paymentPlan,
      paymentType,
      designNft,
      consumedNfts,
    };
  }

  async updateOrder(updateOrder: any): Promise<CardOrder> {
    const { orderId, ...updatableInformation } = updateOrder;
    const cardOrder = await this.cardOrderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: ['user', 'card'],
    });
    if (!cardOrder) {
      throw new NotFoundException('Order not found');
    }

    const result = await this.cardOrderRepository
      .createQueryBuilder()
      .update(CardOrder)
      .set({ ...updatableInformation })
      .where({
        id: orderId,
      })
      .returning('*')
      .execute();

    let updatedUser: CardOrder;

    if (result.raw[0])
      updatedUser = await this.cardOrderRepository.findOne({
        where: {
          id: orderId,
        },
        relations: ['user', 'card'],
      });
    return updatedUser;
  }

  async updateDeliveryAddress(userId: number, newAddress: AddressDto): Promise<void> {
    const orders = await this.cardOrderRepository.find({
      where: { user: { id: userId } },
    });

    if (orders.length > 0) {
      await Promise.all(
        orders.map((order) =>
          this.updateOrder({
            orderId: order.id,
            deliveryAddress: {
              street: newAddress.street,
              city: newAddress.city,
              state: newAddress.state,
              country: newAddress.country,
              zipCode: newAddress.zipCode,
              optional: newAddress.optional,
            },
          })
        )
      );
    }
  }

  async approveOrder(orderId: number, paymentReceipt: any): Promise<CardOrder> {
    const order = await this.cardOrderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'card'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = OrderStatus.APPROVED;
    order.paymentReceipt = paymentReceipt;
    await this.cardOrderRepository.save(order);

    return order;
  }

  async getOrdersDueForPayment(date: Date): Promise<CardOrder[]> {
    return await this.cardOrderRepository.find({
      where: { nextPaymentDate: LessThanOrEqual(date) },
      relations: ['user'],
    });
  }

  async getRejectedOrdersAndValidate(): Promise<CardOrder[]> {
    const cardOrders = await this.cardOrderRepository.find({
      where: { status: In([OrderStatus.REJECTED, OrderStatus.FAILED]) },
      relations: ['user'],
    });
    const mappedOrder = await Promise.all(
      cardOrders.map(async (order) => {
        if (order.user?.subscriptionId) {
          const stripeInformation = await this.stripeService.retrieveInvoice(
            order.user.subscriptionId
          );
          return {
            ...order,
            stripeInformation,
          };
        }
        return {
          ...order,
          stripeInformation: null,
        };
      })
    );

    const csvString = this.generateCsvUsingJson2Csv(mappedOrder);
    await this.mailerService.sendMail({
      to: 'yuko@axysholding.com',
      subject: 'CSV Export',
      text: 'Please find attached the CSV file.',
      template: 'csv-email',
      context: {
        name: 'Yuko',
      },
      attachments: [
        {
          filename: 'orders.csv',
          content: csvString,
          contentType: 'text/csv',
        },
      ],
    });

    return cardOrders;
  }

  async getOrderById(orderId: number): Promise<CardOrder> {
    return this.cardOrderRepository.findOne({
      where: {
        id: orderId,
      },
    });
  }

  async getOrderByCryptoTxId(orderId: string): Promise<CardOrder> {
    return this.cardOrderRepository.findOne({
      where: {
        paymentReceipt: {
          transactionId: orderId
        }
      }
    })
  }

  async autoUpdateOrder(order: CardOrder): Promise<CardOrder> {
    return this.cardOrderRepository.save(order);
  }

  async getOrdersForPaymentReminder(): Promise<CardOrder[]> {
    // TODO
    // Fetch orders where the user needs to be reminded to make a payment
    // For example, orders with active subscriptions and payment due
    const orders = await this.cardOrderRepository.find({
      where: {
        status: OrderStatus.APPROVED,
        // Additional conditions based on logic
      },
      relations: ['user'],
    });

    // Filter orders based on the date logic (e.g., monthly from order date)
    const ordersNeedingReminder = orders.filter((order) => {
      const orderDate = new Date(order.date);
      const now = new Date();
      const monthsSinceOrder = this.monthDiff(orderDate, now);

      // Send reminder if monthsSinceOrder is a multiple of 1 (every month)
      return monthsSinceOrder > 0 && monthsSinceOrder % 1 === 0;
    });

    return ordersNeedingReminder;
  }

  private monthDiff(dateFrom: Date, dateTo: Date): number {
    return (
      dateTo.getMonth() - dateFrom.getMonth() + 12 * (dateTo.getFullYear() - dateFrom.getFullYear())
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updatePendingOrdersToFailed() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // TO FILTER THE PENDING TXs
    // CHECK FROM STRIPE THE STATUS OF THAT TRANSACTION
    // IF THE TRANSACTION ON STRIPE IS STILL ON PENDING OR OFFICIALLY REJECTED,
    const getPendingOrders = await this.cardOrderRepository.find({
      where: { status: OrderStatus.PENDING, date: LessThan(twentyFourHoursAgo) },
      relations: ['user'],
    });

    const ordersThatDontHaveTxId = getPendingOrders.filter((item) => !item.user?.subscriptionId);
    const filterOrderdWithIds = getPendingOrders.filter((item) => item.user?.subscriptionId);
    for (const emptyOrder of ordersThatDontHaveTxId) {
      await this.cardOrderRepository.update(
        {
          id: emptyOrder.id,
        },
        { status: OrderStatus.FAILED, consumedNfts: null }
      );
    }

    for (const order of filterOrderdWithIds) {
      const processInvoice = await this.stripeService.retrieveInvoice(
        order.user.subscriptionId || order.paymentReceipt?.transactionId
      );
      if (processInvoice.status === 'paid' && processInvoice.paid) {
        await this.cardOrderRepository.update(
          {
            id: order.id,
          },
          {
            status: OrderStatus.APPROVED,
            paymentReceipt: order.paymentReceipt
              ? {
                  ...order.paymentReceipt,
                  transactionId: processInvoice.id,
                  created: processInvoice.created,
                  amount: (processInvoice.total / 100).toFixed(2),
                  quantity: 1,
                  customer: processInvoice.customer,
                  currency: processInvoice.currency,
                  paid: processInvoice.paid,
                  hosted_invoice_url: processInvoice.hosted_invoice_url,
                }
              : {
                  transactionId: processInvoice.id,
                  created: processInvoice.created,
                  amount: (processInvoice.total / 100).toFixed(2),
                  quantity: 1,
                  customer: processInvoice.customer,
                  currency: processInvoice.currency,
                  paid: processInvoice.paid,
                  hosted_invoice_url: processInvoice.hosted_invoice_url,
                },
          }
        );
      } else {
        await this.cardOrderRepository.update(
          {
            id: order.id,
          },
          {
            status: OrderStatus.FAILED,
            consumedNfts: null,
            paymentReceipt: order?.paymentReceipt
              ? {
                  ...order.paymentReceipt,
                  transactionId: processInvoice.id,
                }
              : {
                  transactionId: processInvoice.id,
                },
          }
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private generateCsvUsingJson2Csv(orders: any[]): string {
    const fields = [
      { label: 'Order ID', value: 'id' },
      { label: 'Card Type', value: 'cardType' },
      { label: 'Payment Type', value: 'paymentType' },
      { label: 'Delivery Address', value: 'deliveryAddress' },
      { label: 'Status', value: 'status' },
      { label: 'User ID', value: 'userId' },
      { label: 'User Email', value: 'userEmail' },
      { label: 'Stripe Customer ID', value: 'stripeCustomerId' },
      { label: 'Subscription ID', value: 'subscriptionId' },
      { label: 'Stripe Information Existed', value: 'stripeDataExisted' },
      { label: 'Stripe Status', value: 'stripeStatus' },
      { label: 'Stripe Invoice URL', value: 'stripeInvoiceUrl' },
      { label: 'Stripe Created Date', value: 'stripeCreatedAt' },
      { label: 'Stripe Charging ID', value: 'stripeChargeId' },
      { label: 'Stripe Total Paid', value: 'stripeTotalPaid' },
    ];
    // Flatten data
    const rows = orders.map((obj) => {
      const { id, cardType, paymentType, deliveryAddress, status, user, stripeInformation } = obj;

      const addressStr = deliveryAddress
        ? [
            deliveryAddress.street,
            deliveryAddress.city,
            deliveryAddress.state,
            deliveryAddress.country,
            deliveryAddress.zipCode,
            deliveryAddress.optional,
          ]
            .filter(Boolean)
            .join(' ')
        : '';

      return {
        id: id,
        cardType: cardType,
        paymentType: paymentType,
        deliveryAddress: addressStr,
        status: status,
        userId: user?.id ?? '',
        userEmail: user?.email ?? '',
        stripeCustomerId: user?.stripeCustomerId ?? '',
        subscriptionId: user?.subscriptionId ?? '',
        stripeDataExisted: !!stripeInformation,
        stripeStatus: stripeInformation?.paid && stripeInformation?.status === 'paid',
        stripeInvoiceUrl: stripeInformation?.hosted_invoice_url ?? '',
        stripeCreatedAt: new Date(stripeInformation?.created * 1000) ?? '',
        stripeChargeId: stripeInformation?.charge ?? '',
        stripeTotalPaid: stripeInformation?.total ?? '',
      };
    });

    const parser = new Parser({ fields });
    return parser.parse(rows);
  }
}
