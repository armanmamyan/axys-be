import { IsEnum } from 'class-validator';
import { Card } from 'src/card/entities/card.entity';
import { OrderStatus } from 'src/card-orders/enums';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { PaymentType, PaymentPlan } from '../enums';

interface ConsumedNft {
  nftId: string;
  cardCategory: 'Standard' | 'Premium' | 'NFT';
  cardType: string;
  name: string;
}

interface DesignNft {
  nftId: string;
  imgUrl: string;
}

@Entity()
export class CardOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.cardOrder)
  @JoinColumn()
  user: User;

  @Column()
  cardCategory: string;

  @Column()
  cardType: string;

  @IsEnum(PaymentPlan)
  @Column({
    type: 'enum',
    enum: PaymentPlan,
  })
  paymentPlan: PaymentPlan;

  @IsEnum(PaymentType)
  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  paymentType: PaymentType;

  @Column({ type: 'jsonb' })
  deliveryAddress: any;

  @Column({ type: 'jsonb', nullable: true })
  paymentReceipt: any;

  @Column({ type: 'jsonb', nullable: true })
  consumedNfts: any;

  @Column({ type: 'jsonb', nullable: true })
  designNft: any;

  @Column({ default: OrderStatus.PENDING })
  status: OrderStatus;

  // Each card order can result in one card upon approval
  @OneToOne(() => Card, (card) => card.cardOrder, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  card: Card;

  @Column()
  date: Date;

  @Column()
  nextPaymentDate: Date;
}
