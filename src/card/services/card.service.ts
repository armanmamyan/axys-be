// src/cards/services/cards.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Card } from "../entities/card.entity";
import { Repository } from "typeorm";
import { CardOrder } from "src/card-orders/entities/card-order.entity";
import { TransactionStatus } from "src/transactions/enums";
import { OrderStatus } from "src/card-orders/enums";

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(CardOrder)
    private cardOrderRepository: Repository<CardOrder>,
  ) {}

  async createCardForOrder(orderId: number): Promise<Card> {
    const cardOrder = await this.cardOrderRepository.findOne({
      where: {
        id: orderId
      },
      relations: ["user"],
    });
    if (!cardOrder) {
      throw new NotFoundException("Card order not found");
    }

    if (cardOrder.status !== "approved") {
      throw new BadRequestException("Card order is not approved");
    }

    if (cardOrder.card) {
      throw new BadRequestException("Card already issued for this order");
    }

    const user = cardOrder.user;

    // Create card details
    const cardNumber = this.generateCardNumber(); // Implement secure generation
    const expirationDate = this.calculateExpirationDate(); // Implement logic

    const card = this.cardRepository.create({
      cardOrder,
      user,
      cardNumber,
      cardProvider: "Visa", // Or 'MasterCard', based on logic
      balance: 0,
      currency: "USD",
      expirationDate,
    });

    await this.cardRepository.save(card);

    return card;
  }

  async getTransactionsToMonitor(): Promise<any[]> {
    // TODO
    return this.cardOrderRepository.find({
      where: {
        status: OrderStatus.PENDING,
      },
    });
  }

  private generateCardNumber(): string {
    // Implement secure card number generation
    // Ensure uniqueness and security
    return "4111111111111111"; // Placeholder
  }

  private calculateExpirationDate(): Date {
    // Implement expiration date logic
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    return date;
  }
}
