// src/notifications/entities/notification.entity.ts
import { User } from 'src/users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  
  export enum NotificationType {
    PAYMENT_REMINDER = 'Payment Reminder',
    NEW_MESSAGE = 'New Message',
    PROMOTION = 'Promotion',
    // Add other types as needed
  }
  
  @Entity()
  export class Notification {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.notifications, { nullable: false })
    user: User;
  
    @Column({
      type: 'enum',
      enum: NotificationType,
    })
    type: NotificationType;
  
    @Column()
    message: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @Column({ default: false })
    isRead: boolean;
  
  }
  