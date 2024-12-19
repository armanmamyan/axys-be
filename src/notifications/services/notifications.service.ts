// src/notifications/services/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private userService: UsersService,
    private mailerService: MailerService
  ) {}

  async createNotification(
    userEmail: string,
    type: NotificationType,
    message: string
  ): Promise<Notification> {
    const user = await this.userService.findOne(userEmail);
    if (!user) {
      throw new Error('User not found');
    }

    const notification = this.notificationRepository.create({
      user,
      type,
      message,
      createdAt: new Date(),
    });

    return await this.notificationRepository.save(notification);
  }

  async markAsRead(notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: notificationId,
      },
    });
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async sendEmailNotification(userEmail: string, subject: string, message: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject,
      text: message,
    });
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
