import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CardOrder } from '../entities/card-order.entity';
import { CardsService } from 'src/card/services/card.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentPlan } from 'src/card-orders/enums';
import { UpdateOrderStatusDto } from 'src/card-orders/dto/update-order.dto';
import { CreateOrderDto } from 'src/card-orders/dto/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { log } from 'console';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(CardOrder)
    private cardOrderRepository: Repository<CardOrder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cardsService: CardsService,
    private readonly eventEmitter: EventEmitter2,
    
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Partial<CardOrder>> {
    const user = await this.userRepository.findOne({
       where: {
        id:  userId
      },
       relations: ['cardOrder']
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const order = await this.cardOrderRepository.create({
      ...createOrderDto,
      user,
      status: OrderStatus.APPROVED,
      date: new Date()
    });
    
    const nextPaymentDate = new Date(order.date);

    if (order.paymentPlan === PaymentPlan.MONTHLY) {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    } else if (order.paymentPlan === PaymentPlan.ANNUAL) {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    }
    order.nextPaymentDate = nextPaymentDate;
    
    await this.cardOrderRepository.save(order);

    // Emit Scheduler
    this.eventEmitter.emit('order.created', order, user.email);

    const { cardCategory, id, cardType, date, deliveryAddress, paymentPlan, paymentReceipt, paymentType, designNft, consumedNfts } = order;

    return { cardCategory, id, cardType, date, deliveryAddress, paymentPlan, paymentReceipt, paymentType, designNft, consumedNfts };
  }

  async updateOrderStatus(orderId: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<CardOrder> {
    const { status } = updateOrderStatusDto;

    const cardOrder = await this.cardOrderRepository.findOne({
        where: {
            id: orderId
        },
        relations: ['user', 'card']
    });
    if (!cardOrder) {
      throw new NotFoundException('Order not found');
    }

    cardOrder.status = status;
    await this.cardOrderRepository.save(cardOrder);

    if (status === OrderStatus.APPROVED && !cardOrder.card) {
      // Create a card for the user
      await this.cardsService.createCardForOrder(orderId);
    }

    return cardOrder;
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
        id: orderId
      }
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
      dateTo.getMonth() -
      dateFrom.getMonth() +
      12 * (dateTo.getFullYear() - dateFrom.getFullYear())
    );
  }
}