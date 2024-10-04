import { User } from "src/users/entities/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { PaymentType, TransactionPurpose, TransactionStatus } from "../enums";
import { IsEnum, IsNotEmpty } from "class-validator";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentTransactions)
  @JoinColumn()
  sender: User;

  @IsNotEmpty()
  @Column({ nullable: true })
  senderUsername: string;

  @IsNotEmpty()
  @Column()
  receiverAddress: string;

  @ManyToOne(() => User, (user) => user.receivedTransactions, { nullable: true })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column({
    type: "enum",
    enum: PaymentType,
  })
  paymentType: string;

  @IsEnum(TransactionPurpose)
  @Column({
    type: "enum",
    enum: TransactionPurpose,
  })
  transactionPurpose: TransactionPurpose;

  @IsEnum(TransactionStatus)
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.Pending,
  })
  status: TransactionStatus;

  @Column({ type: "jsonb" })
  paymentReceipt: any;

  @Column()
  amount: number;

  @CreateDateColumn()
  date: Date;
  
}
