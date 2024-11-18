import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserAuthController } from './controllers/user.auth.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ThirdPartiesModule } from 'src/third-parties/third-parties.module';
import { CardOrdersModule } from 'src/card-orders/card-orders.module';
import { CardsModule } from 'src/card/card.module';
import { TransactionsModule } from 'src/transactions/transaction.module';
import { KYCModule } from '@/kyc/kyc.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    forwardRef(() => ThirdPartiesModule),
    forwardRef(() => CardOrdersModule),
    forwardRef(() => CardsModule),
    forwardRef(() => TransactionsModule),
    forwardRef(() => KYCModule),
  ],
  providers: [UsersService],
  controllers: [UserController, UserAuthController],
  exports: [UsersService],
})
export class UsersModule {}
