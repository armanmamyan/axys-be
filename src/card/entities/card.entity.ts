import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
import { CardOrder } from 'src/card-orders/entities/card-order.entity';
  
  @Entity()
  export class Card {
    @PrimaryGeneratedColumn()
    id: number;
  
    // Each card belongs to one user
    @ManyToOne(() => User, (user) => user.cards)
    @JoinColumn()
    user: User;
  
    // Each card is associated with one card order
    @OneToOne(() => CardOrder, (cardOrder) => cardOrder.card)
    cardOrder: CardOrder;
  
    @Column()
    cardNumber: string; // Store securely, consider encryption
  
    @Column()
    cardProvider: string; // 'Visa' or 'MasterCard'
  
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    balance: number;
  
    @Column()
    currency: string;
  
    @Column()
    expirationDate: Date;
  
}
  