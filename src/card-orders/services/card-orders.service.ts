import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { CardOrder } from '../entities/card-order.entity';
import { CardsService } from 'src/card/services/card.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentPlan } from 'src/card-orders/enums';
import { CreateOrderDto } from 'src/card-orders/dto/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(CardOrder)
    private cardOrderRepository: Repository<CardOrder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cardsService: CardsService,
    private readonly eventEmitter: EventEmitter2
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

    this.eventEmitter.emit('order.approved', order);

    return order;
  }

  async getOrdersDueForPayment(date: Date): Promise<CardOrder[]> {
    return await this.cardOrderRepository.find({
      where: { nextPaymentDate: LessThanOrEqual(date) },
      relations: ['user'],
    });
  }

  async getOrderById(orderId: number): Promise<CardOrder> {
    return this.cardOrderRepository.findOne({
      where: {
        id: orderId,
      },
    });
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

    const pendingOrders = await this.cardOrderRepository.update(
      {
        status: OrderStatus.PENDING,
        date: LessThan(twentyFourHoursAgo),
      },
      { status: OrderStatus.FAILED, consumedNfts: null },
    );

    if (pendingOrders.affected > 0) {
      console.log(
        `Updated ${pendingOrders.affected} pending orders to FAILED status.`,
      );
    }
  }
}
