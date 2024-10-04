import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards,
    Req,
  } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from '../services/notifications.service';
  
  @Controller('notifications')
  export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}
  
    @UseGuards(AuthGuard)
    @Get()
    async getUserNotifications(@Req() req) {
      const userId = req.user.id;
      return await this.notificationsService.getUserNotifications(userId);
    }
  
  }
  