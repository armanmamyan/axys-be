import { Matches, MaxLength, MinLength } from 'class-validator';
import { Card } from 'src/card/entities/card.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { CardOrder } from 'src/card-orders/entities/card-order.entity';
import { Transaction } from 'src/transactions/entity/transactions.entity';
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  surName: string;

  @Column({ nullable: true })
  avatar: string;

  @Matches('^[a-zA-Z0-9]*$')
  @MaxLength(15)
  @MinLength(5)
  @Column({ nullable: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'Not Passed' })
  kycStatus: string;

  @Column({ nullable: true })
  referral: string;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  onBoarding: boolean;

  @OneToMany(() => CardOrder, (cardOrder) => cardOrder.user, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  cardOrder: CardOrder;

  @OneToMany(() => Card, (card) => card.user)
  cards: Card[];

  @OneToMany(() => Transaction, (transaction) => transaction.sender)
  sentTransactions: Transaction[]

  @OneToMany(() => Transaction, (transaction) => transaction.receiver, { nullable: true })
  receivedTransactions: Transaction[]

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  constructor(user?: Partial<User>) {
    Object.assign(this, user);
  }
}
