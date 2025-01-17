import { Matches, MaxLength, MinLength } from 'class-validator';
import { Card } from 'src/card/entities/card.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { CardOrder } from 'src/card-orders/entities/card-order.entity';
import { Transaction } from 'src/transactions/entity/transactions.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PasswordReset } from '@/auth/entities/passwordReset.entity';
import { KYC } from '@/kyc/entities/kyc.entity';
import { randomBytes } from 'crypto';

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

  @Column({ default: false })
  emailTwoFactorEnabled: boolean;

  @Column({ default: 'Not Passed' })
  kycStatus: string;

  @Column({ nullable: true })
  referral: string;

  @Column({ unique: true, nullable: true })
  shortId: string;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  onBoarding: boolean;

  @Column({ nullable: true })
  fireblocksVaultId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  subscriptionId: string;

  @Column({ nullable: true })
  subscriptionStatus: string;

  @OneToMany(() => CardOrder, (cardOrder) => cardOrder.user, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  cardOrder: CardOrder;

  @OneToMany(() => Card, (card) => card.user)
  cards: Card[];

  @OneToOne(() => KYC, (kyc) => kyc.user, { cascade: true, nullable: true })
  kyc: KYC;

  @Column({ type: 'jsonb', nullable: true })
  primaryAddress: any;

  @OneToMany(() => Transaction, (transaction) => transaction.sender)
  sentTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.receiver, { nullable: true })
  receivedTransactions: Transaction[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => PasswordReset, (passwordReset) => passwordReset.user)
  passwordResets: PasswordReset[];

  @BeforeInsert()
  generateShortId() {
    this.shortId = randomBytes(4).toString('hex');
  }

  constructor(user?: Partial<User>) {
    Object.assign(this, user);
  }
}
