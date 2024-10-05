import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { TransactionsModule } from './transactions/transaction.module';
import { CardsModule } from './card/card.module';
import { CardOrdersModule } from './card-orders/card-orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    MailModule,
    TransactionsModule,
    CardsModule,
    CardOrdersModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
